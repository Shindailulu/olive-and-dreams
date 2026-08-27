import React from "react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 font-light text-brand-charcoal/80 text-sm leading-relaxed">
      <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
        <span className="font-sans text-xs uppercase tracking-widest text-brand-olive font-bold">Legal</span>
        <h1 className="font-serif text-3xl text-brand-burgundy tracking-tight">Privacy Policy</h1>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">1. Information Collection</h2>
        <p>
          We collect personal details (such as full name, email address, shipping address, and phone number) necessary to create your customer account, process transactions, arrange Abuja pickup or nationwide delivery, and send order notifications.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">2. Payment Security</h2>
        <p>
          All online card and bank transactions on Olive & Dreams are securely handled and processed via Paystack. We do not store, log, or have access to your bank details, credit card numbers, or PINs.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">3. Data Sharing</h2>
        <p>
          We do not sell, rent, or share customer data with third parties for promotional purposes. Customer addresses are shared only with our trusted shipping logistics agents to ensure delivery of your purchased clothing items.
        </p>
      </section>
    </div>
  );
}
