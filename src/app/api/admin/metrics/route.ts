import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Aggregates
    const totalOrdersCount = await prisma.order.count();
    
    const paidOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
      },
      select: {
        total: true,
      },
    });
    
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

    const pendingOrdersCount = await prisma.order.count({
      where: {
        orderStatus: "PENDING_PAYMENT",
      },
    });

    const processingOrdersCount = await prisma.order.count({
      where: {
        orderStatus: "PROCESSING",
      },
    });

    const completedOrdersCount = await prisma.order.count({
      where: {
        orderStatus: "COMPLETED",
      },
    });

    const failedPaymentsCount = await prisma.order.count({
      where: {
        paymentStatus: "FAILED",
      },
    });

    const totalCustomersCount = await prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    });

    // 2. Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Inventory alerts: variant items low in stock (< 4)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        stock: {
          lt: 4,
        },
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // 4. Sales analytics over time (grouped by day for the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesHistoryRaw = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Format salesHistory grouping by date string YYYY-MM-DD
    const salesByDayMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      salesByDayMap[dateStr] = 0;
    }

    salesHistoryRaw.forEach((order) => {
      const dateStr = order.createdAt.toISOString().split("T")[0];
      if (salesByDayMap[dateStr] !== undefined) {
        salesByDayMap[dateStr] += order.total;
      } else {
        salesByDayMap[dateStr] = order.total;
      }
    });

    const salesHistory = Object.entries(salesByDayMap).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        pendingOrders: pendingOrdersCount + processingOrdersCount,
        completedOrders: completedOrdersCount,
        failedPayments: failedPaymentsCount,
        totalCustomers: totalCustomersCount,
      },
      recentOrders,
      lowStockVariants,
      salesHistory,
    });
  } catch (error: any) {
    console.error("Fetch Metrics Error:", error);
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}
