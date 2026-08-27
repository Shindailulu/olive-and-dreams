"use client";

import React from "react";
import Link from "next/link";

// Custom SVG Icons
const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 hover:text-brand-olive transition-colors cursor-pointer"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const PinterestIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5 hover:text-brand-olive transition-colors cursor-pointer"
  >
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.41 7.61 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.007-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.211-.174.255-.4.149-1.495-.697-2.43-2.886-2.43-4.647 0-3.793 2.757-7.279 7.942-7.279 4.168 0 7.413 2.97 7.413 6.944 0 4.139-2.611 7.477-6.233 7.477-1.217 0-2.361-.632-2.751-1.378l-.752 2.864c-.272 1.045-1.013 2.355-1.511 3.161 1.12.345 2.302.531 3.528.531 6.622 0 11.988-5.366 11.988-11.987C24.004 5.367 18.639 0 12.017 0z" />
  </svg>
);

export default function Footer() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter Mock submission
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="bg-brand-burgundy text-brand-cream border-t border-brand-cream/10 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Columns: top-aligned, centered grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 items-start">
          
          {/* Col 1: Brand Column (Brand Details + Simplified Contacts + Social Icons) */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl tracking-wide">Olive & Dreams</h2>
              <p className="text-[10px] uppercase tracking-widest text-brand-cream/60">many good things</p>
            </div>
            
            <p className="text-xs font-light text-brand-cream/80 leading-relaxed max-w-xs">
              A contemporary Nigerian lifestyle and ready-to-wear fashion house dedicated to soft, sweet, and confident elegance.
            </p>

            {/* Simplified Contact Details */}
            <div className="text-xs font-light text-brand-cream/80 space-y-1.5 pt-2 border-t border-brand-cream/10">
              <p>Email: info@oliveanddreams.com</p>
              <p>Phone: +234 812 345 6789</p>
            </div>

            {/* Social Icons instead of plain text */}
            <div className="flex space-x-4 pt-1">
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                <InstagramIcon />
              </Link>
              <Link href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Pinterest">
                <PinterestIcon />
              </Link>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-brand-cream/60 font-bold">Navigation</h3>
            <ul className="space-y-2.5 text-xs font-light">
              <li>
                <Link href="/shop" className="hover:text-brand-olive transition-colors focus-visible:ring-1 focus-visible:ring-brand-cream">Shop All</Link>
              </li>
              <li>
                <Link href="/shop?collection=do-me-nice-do-me-jeje" className="hover:text-brand-olive transition-colors focus-visible:ring-1 focus-visible:ring-brand-cream">Debut Collection</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-olive transition-colors focus-visible:ring-1 focus-visible:ring-brand-cream">About the Brand</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-olive transition-colors focus-visible:ring-1 focus-visible:ring-brand-cream">Contact Us</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-olive transition-colors focus-visible:ring-1 focus-visible:ring-brand-cream">FAQs</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care Policy Links */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-brand-cream/60 font-bold">Customer Care</h3>
            <ul className="space-y-2.5 text-xs font-light">
              <li>
                <Link href="/shipping" className="hover:text-brand-olive transition-colors focus-visible:ring-1 focus-visible:ring-brand-cream">Shipping & Delivery</Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-brand-olive transition-colors focus-visible:ring-1 focus-visible:ring-brand-cream">Returns & Exchanges</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-olive transition-colors focus-visible:ring-1 focus-visible:ring-brand-cream">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-olive transition-colors focus-visible:ring-1 focus-visible:ring-brand-cream">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Subscription Form (Replaces old contact col) */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-brand-cream/60 font-bold">Join the Club</h3>
            <p className="text-xs font-light text-brand-cream/80 leading-relaxed">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3 pt-1">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="w-full bg-brand-cream/10 border border-brand-cream/20 text-xs text-brand-cream placeholder-brand-cream/50 px-3.5 py-2.5 focus:outline-none focus:border-brand-cream font-light"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  className="flex-grow bg-brand-cream/10 border border-brand-cream/20 text-xs text-brand-cream placeholder-brand-cream/50 px-3.5 py-2.5 focus:outline-none focus:border-brand-cream font-light"
                />
                <button
                  type="submit"
                  className="bg-brand-cream text-brand-burgundy text-xs uppercase tracking-wider font-semibold px-4 py-2.5 hover:bg-brand-olive hover:text-brand-burgundy transition-colors duration-300"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer Bottom copyright info centered */}
        <div className="mt-16 pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row items-center justify-between text-[10px] font-light text-brand-cream/40 tracking-wider">
          <p>© {new Date().getFullYear()} Olive & Dreams. All rights reserved.</p>
          <p className="pt-2 md:pt-0 uppercase">Made in Nigeria</p>
        </div>
      </div>
    </footer>
  );
}
