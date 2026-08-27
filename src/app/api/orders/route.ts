import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { initializeTransaction } from "@/lib/paystack";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryMethod,
      address,
      city,
      state,
      additionalInstructions,
      items, // array of { productId, size, color, quantity }
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !deliveryMethod || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required checkout fields" }, { status: 400 });
    }

    // 1. Authenticate user if logged in
    const user = await getSessionUser();
    const userId = user ? user.id : null;

    // 2. Fetch shipping rate from settings
    const shippingSetting = await prisma.deliverySetting.findUnique({
      where: { method: deliveryMethod },
    });
    if (!shippingSetting || !shippingSetting.enabled) {
      return NextResponse.json({ error: "Selected delivery method is currently unavailable" }, { status: 400 });
    }
    const deliveryFee = shippingSetting.fee;

    // 3. Process products & verify stock
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: {
            where: {
              size: item.size,
              color: item.color,
            },
          },
        },
      });

      if (!dbProduct) {
        return NextResponse.json({ error: `Product ID ${item.productId} not found` }, { status: 400 });
      }

      const variant = dbProduct.variants[0];
      if (!variant) {
        return NextResponse.json(
          { error: `Variant not found: ${dbProduct.name} (${item.size}/${item.color})` },
          { status: 400 }
        );
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${dbProduct.name} (${item.size}/${item.color}). Only ${variant.stock} left.`,
          },
          { status: 400 }
        );
      }

      const itemPrice = dbProduct.price;
      subtotal += itemPrice * item.quantity;

      orderItemsData.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        size: item.size,
        color: item.color,
        price: itemPrice,
        quantity: item.quantity,
      });
    }

    const total = subtotal + deliveryFee;
    const orderNumber = generateOrderNumber();

    // 4. Create Order & items transactionally
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        subtotal,
        deliveryFee,
        total,
        deliveryMethod,
        address,
        city,
        state,
        additionalInstructions,
        paymentStatus: "PENDING",
        orderStatus: "PENDING_PAYMENT",
        items: {
          create: orderItemsData.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            size: item.size,
            color: item.color,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    // 5. Initiate Paystack Transaction
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const callbackUrl = `${protocol}://${host}/api/checkout/verify`;
    const reference = `REF_${orderNumber}_${Date.now()}`;

    const paystackRes = await initializeTransaction(customerEmail, total, reference, callbackUrl);

    if (!paystackRes.status) {
      // Clean up/cancel order if payment initiation failed completely
      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderStatus: "CANCELLED",
          paymentStatus: "FAILED",
        },
      });
      return NextResponse.json({ error: "Failed to initialize payment gateway: " + paystackRes.message }, { status: 522 });
    }

    // Save payment reference
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paystackReference: reference,
        amount: total,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: paystackRes.data.authorization_url,
      orderId: order.id,
      orderNumber,
    });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
