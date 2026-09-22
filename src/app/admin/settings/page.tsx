import React from "react";
import { getAdminClient } from "@/lib/supabase";
import SettingsForm from "@/components/SettingsForm";

export const revalidate = 0; // Fresh db configurations on layout

export default async function AdminSettingsPage() {
  const supabase = getAdminClient();
  const { data: abujaData } = await supabase
    .from("delivery_methods")
    .select("*")
    .eq("code", "ABUJA_PICKUP")
    .single() as { data: any };

  const { data: nationwideData } = await supabase
    .from("delivery_methods")
    .select("*")
    .eq("code", "NATIONWIDE")
    .single() as { data: any };

  const abuja = abujaData
    ? {
        ...abujaData,
        method: abujaData.code,
        fee: Number(abujaData.fee),
        locationDetails: abujaData.location_details,
      }
    : null;

  const nationwide = nationwideData
    ? {
        ...nationwideData,
        method: nationwideData.code,
        fee: Number(nationwideData.fee),
        locationDetails: nationwideData.location_details,
      }
    : null;

  const about = null;

  return <SettingsForm abuja={abuja} nationwide={nationwide} about={about} />;
}
