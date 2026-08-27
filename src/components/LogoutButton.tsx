"use client";

import React, { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/me", { method: "DELETE" });
      window.location.reload();
    } catch (err) {
      console.error("Logout Error:", err);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-brand-burgundy border border-brand-burgundy/25 hover:border-brand-burgundy px-4 py-2 hover:bg-brand-burgundy/5 transition-all focus-visible:ring-1 focus-visible:ring-brand-burgundy"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{loading ? "Logging Out…" : "Logout"}</span>
    </button>
  );
}
