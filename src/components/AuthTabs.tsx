"use client";

import React, { useState } from "react";

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Reload the page to fetch the authenticated dashboard from the server
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccessMessage("Password reset successfully. You can now sign in.");
      setActiveTab("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-brand-cream border border-brand-burgundy/10 p-6 sm:p-10 shadow-sm space-y-6">
      
      {/* Tabs Switch */}
      <div className="flex border-b border-brand-burgundy/10 pb-4 justify-center space-x-6 text-sm tracking-widest uppercase font-medium">
        <button
          onClick={() => {
            setActiveTab("login");
            setError("");
            setSuccessMessage("");
          }}
          className={`${activeTab === "login" || activeTab === "forgot" ? "text-brand-burgundy underline decoration-2 underline-offset-8 font-semibold" : "text-brand-charcoal/50 hover:text-brand-burgundy"}`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setActiveTab("register");
            setError("");
            setSuccessMessage("");
          }}
          className={`${activeTab === "register" ? "text-brand-burgundy underline decoration-2 underline-offset-8 font-semibold" : "text-brand-charcoal/50 hover:text-brand-burgundy"}`}
        >
          Create Account
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-brand-olive/10 border border-brand-olive/20 text-brand-olive text-xs uppercase tracking-widest font-semibold text-center leading-relaxed">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-3 bg-brand-burgundy/5 border border-brand-burgundy/10 text-brand-burgundy text-xs uppercase tracking-widest font-light text-center leading-relaxed">
          {error}
        </div>
      )}

      {/* Login Form */}
      {activeTab === "login" && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="login-email" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Email Address</label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              placeholder="e.g. name@example.com"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="login-password" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Password</label>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("forgot");
                  setError("");
                  setSuccessMessage("");
                }}
                className="text-[10px] uppercase tracking-wider text-brand-burgundy hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>
            <input
              id="login-password"
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
              {loading ? "Signing In…" : "Sign In"}
            </button>
          </div>
        </form>
      )}

      {/* Register Form */}
      {activeTab === "register" && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="reg-name" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Full Name *</label>
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Chinelo Adebayo"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="reg-email" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Email Address *</label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              placeholder="e.g. name@example.com"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="reg-phone" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Phone Number</label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="e.g. +234 812 345 6789"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="reg-password" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Password *</label>
            <input
              id="reg-password"
              type="password"
              required
              autoComplete="new-password"
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
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </div>
        </form>
      )}

      {/* Forgot Password Form */}
      {activeTab === "forgot" && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div className="p-3 bg-brand-olive/5 border border-brand-olive/10 text-brand-olive text-[11px] uppercase tracking-wider font-light text-center leading-relaxed mb-2">
            Enter your email and a new password to reset your credentials.
          </div>
          
          <div className="flex flex-col space-y-1">
            <label htmlFor="forgot-email" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Email Address</label>
            <input
              id="forgot-email"
              type="email"
              required
              autoComplete="email"
              placeholder="e.g. name@example.com"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="forgot-password" className="text-xs uppercase tracking-wider text-brand-charcoal/60">New Password</label>
            <input
              id="forgot-password"
              type="password"
              required
              placeholder="••••••••"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="confirm-password" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              required
              placeholder="••••••••"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest py-3.5 font-medium hover:bg-brand-burgundy/90 transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy disabled:opacity-50"
            >
              {loading ? "Resetting…" : "Reset Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setError("");
              }}
              className="w-full text-center text-xs uppercase tracking-widest text-brand-charcoal/60 hover:text-brand-burgundy transition-colors font-medium py-2"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
