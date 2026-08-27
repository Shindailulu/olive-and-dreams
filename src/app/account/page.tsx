import React from "react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AuthTabs from "@/components/AuthTabs";
import LogoutButton from "@/components/LogoutButton";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag, Box, Mail, Phone, Calendar } from "lucide-react";

export const revalidate = 0;

export default async function AccountPage() {
  const sessionUser = await getSessionUser();

  // If user is not logged in, show Auth tabs
  if (!sessionUser || sessionUser.role !== "CUSTOMER") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-brand-burgundy">Your Account</h1>
          <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50 mt-2">
            sign in to view orders and saved details
          </p>
        </div>
        <AuthTabs />
      </div>
    );
  }

  // Fetch customer orders
  const orders = await prisma.order.findMany({
    where: { userId: sessionUser.id },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="border-b border-brand-burgundy/10 pb-6 mb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-olive font-bold">Customer Portal</span>
          <h1 className="font-serif text-3xl text-brand-burgundy mt-2">Welcome, {sessionUser.name}</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Card (Col 4) */}
        <aside className="lg:col-span-4 bg-brand-burgundy/5 p-6 border border-brand-burgundy/5 space-y-4 self-start">
          <h2 className="font-serif text-lg text-brand-burgundy border-b border-brand-burgundy/5 pb-2">Profile Details</h2>
          
          <div className="space-y-3 text-sm font-light text-brand-charcoal/80">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-brand-olive" />
              <span>{sessionUser.email}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-brand-olive" />
              <span>{sessionUser.role === "CUSTOMER" ? "Customer Account" : "Store Administrator"}</span>
            </div>
          </div>
        </aside>

        {/* Order History Listing (Col 8) */}
        <main className="lg:col-span-8 space-y-6">
          <h2 className="font-serif text-xl text-brand-burgundy">Your Orders</h2>
          
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-brand-burgundy/10 bg-brand-cream p-6 shadow-sm space-y-4"
                >
                  
                  {/* Order header row */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-brand-burgundy/5 pb-4 text-xs uppercase tracking-wider text-brand-charcoal/50">
                    <div className="flex space-x-4">
                      <span>Order: <span className="font-medium text-brand-charcoal">{order.orderNumber}</span></span>
                      <span>Date: {new Date(order.createdAt).toLocaleDateString("en-NG")}</span>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <span className="font-light">Payment:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${order.paymentStatus === "PAID" ? "bg-brand-olive/15 text-brand-olive" : "bg-brand-burgundy/10 text-brand-burgundy"}`}
                      >
                        {order.paymentStatus}
                      </span>
                      <span className="font-light ml-2">Order Status:</span>
                      <span className="font-semibold text-brand-charcoal">{order.orderStatus}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm font-light">
                        <div>
                          <p className="font-serif text-brand-burgundy">{item.productName}</p>
                          <p className="text-xs text-brand-charcoal/50 uppercase tracking-widest mt-0.5">
                            {item.size} / {item.color} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-sans text-brand-charcoal">{formatNaira(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing total */}
                  <div className="border-t border-brand-burgundy/5 pt-4 flex justify-between items-center text-sm">
                    <span className="font-light text-brand-charcoal/60">
                      Method: {order.deliveryMethod === "ABUJA_PICKUP" ? "Showroom Pickup" : "Nationwide Delivery"}
                    </span>
                    <span className="font-semibold text-brand-burgundy">
                      Total Paid: {formatNaira(order.total)}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-burgundy/5 rounded-lg border border-brand-burgundy/5">
              <Box className="h-8 w-8 text-brand-burgundy/40 mx-auto mb-3" />
              <p className="font-serif text-base text-brand-burgundy">No orders placed yet.</p>
              <p className="font-sans text-sm text-brand-charcoal/60 mt-1 font-light">
                Your future purchase records will appear here once confirmed.
              </p>
              <Link
                href="/shop"
                className="inline-block bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-6 py-3 mt-6 hover:bg-brand-burgundy/90 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
