import React from "react";

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 font-light text-brand-charcoal/80 text-sm leading-relaxed">
      <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
        <span className="font-sans text-xs uppercase tracking-widest text-brand-olive font-bold">Policy</span>
        <h1 className="font-serif text-3xl text-brand-burgundy tracking-tight">Shipping & Delivery</h1>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">Abuja Showroom Pickup</h2>
        <p>
          Customers residing in or visiting Abuja can opt for free showroom pickup. Once payment is verified, orders are typically prepared and ready for collection within 24 to 48 hours. You will receive an email and a phone call/SMS notification when your item is packed. Please present your order confirmation email at the showroom desk upon pickup.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">Nationwide Doorstep Delivery</h2>
        <p>
          We deliver to all states across Nigeria using reputable domestic logistics networks. Standard delivery times are as follows:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 pt-1">
          <li><strong>Abuja & Lagos Cities:</strong> 2 - 3 business days.</li>
          <li><strong>Other Southern & Northern States:</strong> 3 - 6 business days.</li>
        </ul>
        <p>
          Nationwide delivery fees are dynamically calculated during the checkout process based on active pricing sets configured in the store settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">Tracking Your Parcel</h2>
        <p>
          A tracking number and dispatch confirmation link will be shared via email once your order is hand-off to our delivery agents. Ensure your phone number is active to coordinate delivery timing.
        </p>
      </section>
    </div>
  );
}
