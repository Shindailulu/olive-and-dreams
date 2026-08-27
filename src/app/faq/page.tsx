"use client";

import React, { useState } from "react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Where are Olive & Dreams garments produced?",
      a: "All our clothing is proudly designed, patterned, and manufactured in Nigeria. We source premium fabrics globally and construct them locally with high-quality finishes.",
    },
    {
      q: "How do I choose the correct size?",
      a: "We provide an explicit Size Guide on every product details screen. Our sizing is based on UK standard metrics. If you are in-between sizes or need help, please contact our support team via WhatsApp.",
    },
    {
      q: "Can I modify my shipping address or cancel my order?",
      a: "To ensure fast delivery, we process orders quickly. Address changes can only be accommodated within 2 hours of payment by calling support. Cancellations are not accepted once the order has been processed.",
    },
    {
      q: "What delivery options do you offer?",
      a: "We offer Abuja Showroom Pickup (Free) and Nationwide Doorstep Delivery. Abuja showroom pickup is ready in 1-2 working days. Nationwide shipping takes 2-4 working days (major cities like Lagos) or 3-7 working days (remote areas).",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="font-sans text-xs uppercase tracking-widest text-brand-olive font-bold">Help Desk</span>
        <h1 className="font-serif text-3xl text-brand-burgundy tracking-tight">Frequently Asked Questions</h1>
      </div>

      <div className="space-y-4 pt-8">
        {faqs.map((faq, idx) => {
          const isOpen = activeIndex === idx;
          return (
            <div key={idx} className="border-b border-brand-burgundy/10 pb-5">
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full text-left flex justify-between items-center py-3 group focus:outline-none"
                aria-expanded={isOpen}
              >
                <h3 className="font-serif text-base md:text-lg text-brand-burgundy font-medium leading-snug group-hover:text-brand-olive transition-colors">
                  {idx + 1}. {faq.q}
                </h3>
                <span className="text-brand-burgundy text-xl font-light ml-4 select-none">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="font-sans text-sm font-light text-brand-charcoal/80 leading-relaxed pl-4 pb-4 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
