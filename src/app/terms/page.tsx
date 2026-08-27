import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 font-light text-brand-charcoal/80 text-sm leading-relaxed">
      <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
        <span className="font-sans text-xs uppercase tracking-widest text-brand-olive font-bold">Legal</span>
        <h1 className="font-serif text-3xl text-brand-burgundy tracking-tight">Terms & Conditions</h1>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">1. Agreement to Terms</h2>
        <p>
          By accessing and browsing this storefront or placing an order, you agree to comply with and be bound by these terms, shipping policies, and return guidelines.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">2. Pricing & Payments</h2>
        <p>
          All product prices are quoted in Nigerian Naira (₦). Transactions are processed immediately upon order creation. We reserve the right to modify delivery rates, correct catalog typos, or cancel orders containing pricing errors.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">3. Intellectual Property</h2>
        <p>
          All content displayed on this website — including the logo, photography, copywriting, design system, and patterns — is the exclusive property of Olive & Dreams and may not be reproduced, copied, or used for commercial purposes.
        </p>
      </section>
    </div>
  );
}
