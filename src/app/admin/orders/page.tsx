import React from "react";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { ClipboardList, ArrowUpRight } from "lucide-react";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-brand-burgundy">Orders</h1>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50 mt-1">
          Manage and fulfill client purchases
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-brand-cream border border-brand-burgundy/10 shadow-sm p-6 overflow-x-auto">
        {orders.length > 0 ? (
          <table className="w-full text-left text-sm font-light">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-brand-charcoal/50 border-b border-brand-burgundy/10 pb-2">
                <th className="pb-3 font-bold">Order #</th>
                <th className="pb-3 font-bold">Customer</th>
                <th className="pb-3 font-bold">Date</th>
                <th className="pb-3 font-bold">Amount</th>
                <th className="pb-3 font-bold">Payment</th>
                <th className="pb-3 font-bold">Fulfillment Status</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-burgundy/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-burgundy/5 transition-colors">
                  <td className="py-4 font-serif text-base text-brand-burgundy">
                    <Link href={`/admin/orders/${order.id}`}>
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="font-medium text-brand-charcoal">{order.customerName}</p>
                      <p className="text-xs text-brand-charcoal/50">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 font-sans text-xs">
                    {new Date(order.createdAt).toLocaleDateString("en-NG")}
                  </td>
                  <td className="py-4 font-sans font-medium">{formatNaira(order.total)}</td>
                  <td className="py-4">
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold ${order.paymentStatus === "PAID" ? "bg-brand-olive/15 text-brand-olive" : "bg-brand-burgundy/10 text-brand-burgundy"}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 text-xs font-medium uppercase tracking-wider">
                    {order.orderStatus}
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs uppercase tracking-widest text-brand-burgundy hover:underline inline-flex items-center"
                    >
                      <span>Detail</span>
                      <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <ClipboardList className="h-10 w-10 text-brand-burgundy/40 mx-auto mb-4" />
            <h2 className="font-serif text-lg text-brand-burgundy">No orders found.</h2>
            <p className="font-sans text-sm text-brand-charcoal/60 mt-1 font-light">
              Orders will appear here once checkout transactions are created.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
