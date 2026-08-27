import React from "react";

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 font-light text-brand-charcoal/80 text-sm leading-relaxed">
      <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
        <span className="font-sans text-xs uppercase tracking-widest text-brand-olive font-bold">Policy</span>
        <h1 className="font-serif text-3xl text-brand-burgundy tracking-tight">Returns & Exchanges</h1>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">Return Window</h2>
        <p>
          We want you to love your Olive & Dreams pieces. If you are not completely satisfied with your purchase, we accept return requests for store credit or product exchange within <strong>7 days</strong> of delivery or showroom pickup.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">Return Eligibility</h2>
        <p>
          To be eligible for a return or exchange, all items must meet the following criteria:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 pt-1">
          <li>Garments must be unworn, unwashed, and undamaged.</li>
          <li>Original tags, hangers, and packaging must be intact.</li>
          <li>Items must not have any makeup stains, perfume scents, or modifications.</li>
        </ul>
        <p className="italic text-brand-burgundy">
          Note: Sale items and custom-tailored adjustments are final sale and cannot be returned or exchanged.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-burgundy font-medium">Process</h2>
        <p>
          To initiate a return, email us at <a href="mailto:returns@oliveanddreams.com" className="underline text-brand-burgundy">returns@oliveanddreams.com</a> with your order number and reason for return. For Abuja orders, you can drop off items at our Wuse II showroom. For nationwide orders, return shipping costs are the responsibility of the customer.
        </p>
      </section>
    </div>
  );
}
