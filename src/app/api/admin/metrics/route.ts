import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getAdminClient();

    // 1. Total orders
    const { count: totalOrdersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // 2. Revenue
    const { data: paidOrders } = await supabase
      .from("orders")
      .select("total")
      .eq("payment_status", "paid");
      
    const revenue = paidOrders?.reduce((acc, order) => acc + (Number(order.total) || 0), 0) || 0;

    // 3. Pending orders
    const { count: pendingOrdersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // 4. Processing orders (paid but not fulfilled)
    const { count: processingOrdersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid");

    // 5. Completed orders
    const { count: completedOrdersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "fulfilled");

    // 6. Failed orders
    const { count: failedOrdersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "failed");

    // 7. Customers count
    const { count: customersCount } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    // 8. Recent orders
    const { data: recentOrdersData } = await supabase
      .from("orders")
      .select("id, order_number, guest_name, total, payment_status, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
      
    const recentOrders = recentOrdersData?.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.guest_name,
      total: Number(order.total),
      paymentStatus: order.payment_status?.toUpperCase() || "PENDING",
      orderStatus: order.status?.toUpperCase() || "PENDING",
      createdAt: order.created_at,
    })) || [];

    // 9. Low stock variants
    const { data: lowStockData } = await supabase
      .from("product_variants")
      .select("*, products(name, slug)")
      .lt("stock_quantity", 4);
      
    const lowStockVariants = lowStockData?.map(variant => ({
      id: variant.id,
      productId: variant.product_id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock_quantity,
      sku: variant.sku,
      product: {
        name: (variant.products as any)?.name || "Unknown Product",
        slug: (variant.products as any)?.slug || "",
      }
    })) || [];

    // 10. Sales history (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentSalesData } = await supabase
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "paid")
      .gte("created_at", sevenDaysAgo.toISOString());
      
    // Group sales by day
    const salesByDay = new Map<string, number>();
    
    recentSalesData?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      const amount = Number(order.total) || 0;
      salesByDay.set(date, (salesByDay.get(date) || 0) + amount);
    });
    
    const salesHistory = Array.from(salesByDay.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      summary: {
        totalOrders: totalOrdersCount || 0,
        revenue,
        pendingOrders: pendingOrdersCount || 0,
        processingOrders: processingOrdersCount || 0,
        completedOrders: completedOrdersCount || 0,
        failedOrders: failedOrdersCount || 0,
        customers: customersCount || 0,
      },
      recentOrders,
      lowStockVariants,
      salesHistory,
    });
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
