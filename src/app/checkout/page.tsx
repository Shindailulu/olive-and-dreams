import React from "react";
import { getAdminClient } from "@/lib/supabase";
import CheckoutForm from "@/components/CheckoutForm";

export const revalidate = 0; // Fetch fresh delivery configurations live

export default async function CheckoutPage() {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('delivery_methods')
    .select('code, name, fee, enabled, instructions, location_details')
    .eq('enabled', true);

  const deliveryOptions = (data || []).map((d: any) => ({
    method: d.code,
    fee: Number(d.fee),
    instructions: d.instructions,
    locationDetails: d.location_details,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="border-b border-brand-burgundy/10 pb-6 mb-12">
        <h1 className="font-serif text-3xl text-brand-burgundy">Checkout</h1>
      </div>

      <CheckoutForm deliveryOptions={deliveryOptions} />
    </div>
  );
}
