"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid admin credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-brand-cream border border-brand-burgundy/10 p-8 sm:p-10 shadow-sm space-y-6">
        
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="relative w-40 h-10 mx-auto">
            <Image src="/logo-dark.png" alt="Olive & Dreams Logo" fill style={{ objectFit: "contain" }} />
          </div>
          <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50">
            Administrative Console
          </p>
        </div>

        {error && (
          <div className="p-3 bg-brand-burgundy/5 border border-brand-burgundy/10 text-brand-burgundy text-xs uppercase tracking-widest font-light text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="admin-email" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              placeholder="admin@oliveanddreams.com"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="admin-password" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest py-3.5 font-medium hover:bg-brand-burgundy/90 transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy disabled:opacity-50"
            >
              {loading ? "Authenticating…" : "Login to Console"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
