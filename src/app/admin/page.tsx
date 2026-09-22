import React from "react";
import { getAdminClient } from "@/lib/supabase";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag, AlertTriangle, Users, ClipboardList, CheckCircle } from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = getAdminClient();

  // 1. Fetch metrics directly from DB
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });
  
  const { data: paidOrders } = await supabase
    .from("orders")
    .select("total")
    .eq("payment_status", "paid");
  
  const totalRevenue = ((paidOrders || []) as any[]).reduce((sum: number, o: any) => sum + Number(o.total), 0);

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: processingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid");

  const { count: completedOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "fulfilled");

  const { count: failedPayments } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", "failed");

  const { count: totalCustomers } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  // 2. Fetch low stock variants (< 4)
  const { data: lowStockData } = await supabase
    .from("product_variants")
    .select("*, products(name, slug)")
    .lt("stock_quantity", 4)
    .limit(5);
  const lowStock = (lowStockData || []) as any[];

  // 3. Fetch recent orders
  const { data: recentOrdersData } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  const recentOrders = (recentOrdersData || []) as any[];

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
            <p className="font-sans text-2xl font-bold text-brand-burgundy">{totalOrders || 0}</p>
            <span className="text-xs text-brand-charcoal/50">({processingOrders || 0} processing)</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-brand-cream border border-brand-burgundy/10 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 font-medium">Customers</span>
            <Users className="h-4.5 w-4.5 text-brand-olive" />
          </div>
          <p className="font-sans text-2xl font-bold text-brand-burgundy mt-4">
            {totalCustomers || 0}
          </p>
        </div>

        {/* Issues Warning */}
        <div className="bg-brand-cream border border-brand-burgundy/10 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 font-medium">Attention Required</span>
            <AlertTriangle className="h-4.5 w-4.5 text-brand-burgundy" />
          </div>
          <div className="mt-4 text-xs space-y-1 text-brand-charcoal/70">
            <p><strong>{failedPayments || 0}</strong> Failed Payments</p>
            <p><strong>{pendingOrders || 0}</strong> Unpaid Orders</p>
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

          {(recentOrders || []).length > 0 ? (
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
                  {(recentOrders || []).map((order) => (
                    <tr key={order.id} className="hover:bg-brand-burgundy/5 transition-colors">
                      <td className="py-3 font-medium text-brand-burgundy">
                        <Link href={`/admin/orders/${order.id}`}>{order.order_number}</Link>
                      </td>
                      <td className="py-3">{order.guest_name}</td>
                      <td className="py-3 font-sans font-medium">{formatNaira(Number(order.total))}</td>
                      <td className="py-3">
                        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold ${order.payment_status === "paid" ? "bg-brand-olive/15 text-brand-olive" : "bg-brand-burgundy/10 text-brand-burgundy"}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3 text-xs uppercase">{order.status}</td>
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

          {(lowStock || []).length > 0 ? (
            <div className="space-y-4">
              {(lowStock || []).map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs font-light border-b border-brand-burgundy/5 pb-3">
                  <div>
                    <p className="font-serif text-brand-burgundy">{item.products?.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mt-0.5">
                      Size {item.size} / {item.color}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold ${item.stock_quantity === 0 ? "bg-brand-burgundy/10 text-brand-burgundy" : "bg-brand-gold/15 text-brand-gold"}`}>
                    {item.stock_quantity === 0 ? "Sold Out" : `${item.stock_quantity} left`}
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
