import React from "react";
import { getSessionUser } from "@/lib/auth";
import AdminLoginPage from "./login/page";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { LayoutDashboard, ShoppingBag, ClipboardList, CreditCard, Settings, Globe } from "lucide-react";

export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();

  // Force login view in-place if not authenticated as admin
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col md:flex-row">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-brand-burgundy text-brand-cream border-r border-brand-cream/10 flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-xl tracking-wide">Olive & Dreams</h2>
            <span className="text-[10px] uppercase tracking-widest text-brand-cream/50 block mt-1">
              Store Owner Console
            </span>
          </div>

          <nav className="flex flex-col space-y-2 text-xs uppercase tracking-widest font-medium">
            <Link
              href="/admin"
              className="flex items-center space-x-3 p-3 rounded hover:bg-brand-cream/10 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center space-x-3 p-3 rounded hover:bg-brand-cream/10 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Products</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center space-x-3 p-3 rounded hover:bg-brand-cream/10 transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              <span>Orders</span>
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center space-x-3 p-3 rounded hover:bg-brand-cream/10 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              <span>Payments</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center space-x-3 p-3 rounded hover:bg-brand-cream/10 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Delivery Settings</span>
            </Link>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="border-t border-brand-cream/10 pt-6 mt-8 space-y-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-brand-cream/70 hover:text-brand-cream"
          >
            <Globe className="h-4 w-4" />
            <span>Go to Storefront</span>
          </Link>
          <div className="flex justify-start">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}
