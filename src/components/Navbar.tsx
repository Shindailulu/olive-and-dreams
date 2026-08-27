"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "./StoreContext";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";

export default function Navbar() {
  const { cartCount } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/90 backdrop-blur-md border-b border-brand-burgundy/5">
      {/* Top Announcement Bar */}
      <div className="bg-brand-burgundy text-brand-cream text-[10px] uppercase tracking-[0.2em] py-2.5 text-center font-medium font-sans border-b border-brand-cream/10">
        Shop Anywhere — Nationwide Shipping Available
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-brand-burgundy p-2 hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>

          {/* Navigation Links - Left Side (Desktop) */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-widest uppercase">
            <Link
              href="/shop"
              className="text-brand-burgundy hover:text-brand-olive transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy"
            >
              Shop
            </Link>
            <Link
              href="/shop?collection=do-me-nice-do-me-jeje"
              className="text-brand-burgundy hover:text-brand-olive transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy"
            >
              Collection
            </Link>
            <Link
              href="/about"
              className="text-brand-burgundy hover:text-brand-olive transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy"
            >
              About
            </Link>
          </nav>

          {/* Logo - Center */}
          <div className="flex-1 flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link href="/" className="flex items-center focus-visible:ring-2 focus-visible:ring-brand-burgundy">
              {/* Fallback to text logo if image fails, but use image */}
              <div className="relative w-40 h-10">
                <Image
                  src="/logo-dark.png"
                  alt="Olive & Dreams Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Icons - Right Side */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-brand-burgundy p-2 hover:text-brand-olive transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy"
              aria-label="Search Catalog"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="text-brand-burgundy p-2 hover:text-brand-olive transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy"
              aria-label="View Wishlist"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
            </Link>

            {/* Account Link */}
            <Link
              href="/account"
              className="text-brand-burgundy p-2 hover:text-brand-olive transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy"
              aria-label="Customer Account"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="text-brand-burgundy p-2 hover:text-brand-olive transition-colors relative focus-visible:ring-2 focus-visible:ring-brand-burgundy"
              aria-label={`Shopping Cart with ${cartCount} items`}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-burgundy text-brand-cream text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold tracking-tight">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Floating search container */}
      {searchOpen && (
        <div className="bg-brand-cream border-t border-brand-burgundy/10 px-4 py-3 shadow-md animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center">
            <input
              type="search"
              placeholder="Search pieces, dresses, tops…"
              className="w-full bg-transparent border-b border-brand-burgundy py-2 text-sm tracking-wide text-brand-burgundy placeholder-brand-burgundy/50 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="ml-4 bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-4 py-2 hover:bg-brand-burgundy/90 transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-cream border-t border-brand-burgundy/10 shadow-lg px-4 py-6 space-y-4 font-serif text-lg text-brand-burgundy">
          <Link
            href="/shop"
            className="block py-2 hover:text-brand-olive"
            onClick={() => setMobileMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/shop?collection=do-me-nice-do-me-jeje"
            className="block py-2 hover:text-brand-olive"
            onClick={() => setMobileMenuOpen(false)}
          >
            Collection
          </Link>
          <Link
            href="/about"
            className="block py-2 hover:text-brand-olive"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
        </div>
      )}
    </header>
  );
}
