import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="font-sans text-xs uppercase tracking-widest text-brand-olive font-bold">Get In Touch</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand-burgundy tracking-tight">We are here for you</h1>
        <p className="font-sans text-sm text-brand-charcoal/60 leading-relaxed font-light">
          Have questions about sizing, shipping, or returns? Contact our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        
        {/* Showroom Details */}
        <div className="border border-brand-burgundy/10 p-8 space-y-6 bg-brand-cream shadow-sm font-light text-brand-charcoal/80 text-sm">
          <h2 className="font-serif text-xl text-brand-burgundy border-b border-brand-burgundy/5 pb-2">The Showroom</h2>
          
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-brand-olive mt-0.5" />
            <div>
              <p className="font-medium text-brand-charcoal">Olive & Dreams Showroom</p>
              <p className="mt-0.5">Suite 12, Olive Plaza, Wuse II, Abuja, Nigeria</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-brand-olive mt-0.5" />
            <div>
              <p className="font-medium text-brand-charcoal">Opening Hours</p>
              <p className="mt-0.5">Monday – Saturday: 9:00 AM – 6:00 PM</p>
              <p>Sundays: Closed</p>
            </div>
          </div>
        </div>

        {/* Online Support */}
        <div className="border border-brand-burgundy/10 p-8 space-y-6 bg-brand-cream shadow-sm font-light text-brand-charcoal/80 text-sm">
          <h2 className="font-serif text-xl text-brand-burgundy border-b border-brand-burgundy/5 pb-2">Support & Enquiries</h2>
          
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-brand-olive mt-0.5" />
            <div>
              <p className="font-medium text-brand-charcoal">Email Address</p>
              <p className="mt-0.5 hover:text-brand-olive"><a href="mailto:info@oliveanddreams.com">info@oliveanddreams.com</a></p>
              <p className="text-xs text-brand-charcoal/50">For order enquiries and bulk orders</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="h-5 w-5 text-brand-olive mt-0.5" />
            <div>
              <p className="font-medium text-brand-charcoal">Phone & WhatsApp</p>
              <p className="mt-0.5">+234 812 345 6789</p>
              <p className="text-xs text-brand-charcoal/50">Mon-Sat, 9AM - 6PM</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
