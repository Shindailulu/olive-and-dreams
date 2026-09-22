import React from "react";
import { getAdminClient } from "@/lib/supabase";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { CreditCard, Box } from "lucide-react";

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const supabase = getAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .not("payment_reference", "is", null)
    .order("created_at", { ascending: false });

  const payments = (orders || []).map((order: any) => ({
    id: order.id,
    paystackReference: order.payment_reference,
    amount: Number(order.total),
    createdAt: order.created_at,
    method: order.payment_gateway || "N/A",
    status: order.payment_status === "paid" ? "SUCCESSFUL" : (order.payment_status?.toUpperCase() || "UNKNOWN"),
    order: {
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.guest_name,
    },
  }));

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-brand-burgundy">Payments</h1>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50 mt-1">
          Track card, transfer, and USSD transactions
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-brand-cream border border-brand-burgundy/10 shadow-sm p-6 overflow-x-auto">
        {payments.length > 0 ? (
          <table className="w-full text-left text-sm font-light">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-brand-charcoal/50 border-b border-brand-burgundy/10 pb-2">
                <th className="pb-3 font-bold">Transaction Reference</th>
                <th className="pb-3 font-bold">Order #</th>
                <th className="pb-3 font-bold">Customer Name</th>
                <th className="pb-3 font-bold">Amount</th>
                <th className="pb-3 font-bold">Paid Date</th>
                <th className="pb-3 font-bold">Method</th>
                <th className="pb-3 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-burgundy/5">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-brand-burgundy/5 transition-colors">
                  <td className="py-4 font-mono text-xs text-brand-burgundy">
                    {payment.paystackReference}
                  </td>
                  <td className="py-4 font-serif font-medium">
                    <Link href={`/admin/orders/${payment.order.id}`} className="hover:underline text-brand-burgundy">
                      {payment.order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-4">{payment.order.customerName}</td>
                  <td className="py-4 font-sans font-medium">{formatNaira(payment.amount)}</td>
                  <td className="py-4 font-sans text-xs">
                    {new Date(payment.createdAt).toLocaleString("en-NG")}
                  </td>
                  <td className="py-4 text-xs font-medium uppercase tracking-wider">
                    {payment.method || "N/A"}
                  </td>
                  <td className="py-4 text-right">
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold ${payment.status === "SUCCESSFUL" ? "bg-brand-olive/15 text-brand-olive" : "bg-brand-burgundy/10 text-brand-burgundy"}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <CreditCard className="h-10 w-10 text-brand-burgundy/40 mx-auto mb-4" />
            <h2 className="font-serif text-lg text-brand-burgundy">No transactions recorded.</h2>
            <p className="font-sans text-sm text-brand-charcoal/60 mt-1 font-light">
              Payment transaction logs will automatically populate here via Paystack callbacks.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
