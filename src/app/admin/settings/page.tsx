import React from "react";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";

export const revalidate = 0; // Fresh db configurations on layout

export default async function AdminSettingsPage() {
  const abuja = await prisma.deliverySetting.findUnique({
    where: { method: "ABUJA_PICKUP" },
  });

  const nationwide = await prisma.deliverySetting.findUnique({
    where: { method: "NATIONWIDE" },
  });

  const about = await prisma.aboutPageSetting.findFirst();

  return <SettingsForm abuja={abuja} nationwide={nationwide} about={about} />;
}
