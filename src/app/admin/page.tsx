import React from "react";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag, AlertTriangle, Users, ClipboardList, CheckCircle } from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // 1. Fetch metrics directly from DB
  const totalOrders = await prisma.order.count();
  
  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: "PAID" },
    select: { total: true },
  });
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = await prisma.order.count({
    where: { orderStatus: "PENDING_PAYMENT" },
  });

  const processingOrders = await prisma.order.count({
    where: { orderStatus: "PROCESSING" },
  });

  const completedOrders = await prisma.order.count({
    where: { orderStatus: "COMPLETED" },
  });

  const failedPayments = await prisma.order.count({
    where: { paymentStatus: "FAILED" },
  });

  const totalCustomers = await prisma.user.count({
    where: { role: "CUSTOMER" },
  });

  // 2. Fetch low stock variants (< 4)
  const lowStock = await prisma.productVariant.findMany({
    where: { stock: { lt: 4 } },
    include: {
      product: {
        select: { name: true, slug: true },
      },
    },
    take: 5,
  });

  // 3. Fetch recent orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl text-brand-burgundy">Dashboard Overview</h1>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50 mt-1">
          Real-time boutique metrics
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-brand-cream border border-brand-burgundy/10 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 font-medium">Total Revenue</span>
            <span className="text-brand-olive font-semibold text-xs">Paid</span>
          </div>
          <p className="font-sans text-2xl font-bold text-brand-burgundy mt-4">
            {formatNaira(totalRevenue)}
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-brand-cream border border-brand-burgundy/10 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 font-medium">Orders</span>
            <ClipboardList className="h-4.5 w-4.5 text-brand-olive" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <p className="font-sans text-2xl font-bold text-brand-burgundy">{totalOrders}</p>
            <span className="text-xs text-brand-charcoal/50">({processingOrders} processing)</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-brand-cream border border-brand-burgundy/10 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 font-medium">Customers</span>
            <Users className="h-4.5 w-4.5 text-brand-olive" />
          </div>
          <p className="font-sans text-2xl font-bold text-brand-burgundy mt-4">
            {totalCustomers}
          </p>
        </div>

        {/* Issues Warning */}
        <div className="bg-brand-cream border border-brand-burgundy/10 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 font-medium">Attention Required</span>
            <AlertTriangle className="h-4.5 w-4.5 text-brand-burgundy" />
          </div>
          <div className="mt-4 text-xs space-y-1 text-brand-charcoal/70">
            <p><strong>{failedPayments}</strong> Failed Payments</p>
            <p><strong>{pendingOrders}</strong> Unpaid Orders</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders Log (Col 8) */}
        <div className="lg:col-span-8 bg-brand-cream border border-brand-burgundy/10 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-brand-burgundy/5 pb-4">
            <h2 className="font-serif text-lg text-brand-burgundy">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs uppercase tracking-widest text-brand-burgundy hover:underline flex items-center">
              View All <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-light">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-brand-charcoal/50 border-b border-brand-burgundy/10 pb-2">
                    <th className="pb-3 font-bold">Order #</th>
                    <th className="pb-3 font-bold">Customer</th>
                    <th className="pb-3 font-bold">Total</th>
                    <th className="pb-3 font-bold">Payment</th>
                    <th className="pb-3 font-bold">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-burgundy/5">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-brand-burgundy/5 transition-colors">
                      <td className="py-3 font-medium text-brand-burgundy">
                        <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                      </td>
                      <td className="py-3">{order.customerName}</td>
                      <td className="py-3 font-sans font-medium">{formatNaira(order.total)}</td>
                      <td className="py-3">
                        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold ${order.paymentStatus === "PAID" ? "bg-brand-olive/15 text-brand-olive" : "bg-brand-burgundy/10 text-brand-burgundy"}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 text-xs">{order.orderStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm font-light text-brand-charcoal/50 text-center py-6">No orders recorded yet.</p>
          )}
        </div>

        {/* Inventory alerts column (Col 4) */}
        <div className="lg:col-span-4 bg-brand-cream border border-brand-burgundy/10 p-6 shadow-sm space-y-6 self-start">
          <div className="flex justify-between items-center border-b border-brand-burgundy/5 pb-4">
            <h2 className="font-serif text-lg text-brand-burgundy">Inventory Alerts</h2>
            <Link href="/admin/products" className="text-xs uppercase tracking-widest text-brand-burgundy hover:underline">
              Manage Stock
            </Link>
          </div>

          {lowStock.length > 0 ? (
            <div className="space-y-4">
              {lowStock.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs font-light border-b border-brand-burgundy/5 pb-3">
                  <div>
                    <p className="font-serif text-brand-burgundy">{item.product.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mt-0.5">
                      Size {item.size} / {item.color}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold ${item.stock === 0 ? "bg-brand-burgundy/10 text-brand-burgundy" : "bg-brand-gold/15 text-brand-gold"}`}>
                    {item.stock === 0 ? "Sold Out" : `${item.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-brand-olive flex items-center justify-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>All variant stocks are healthy.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
