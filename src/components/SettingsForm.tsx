"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check } from "lucide-react";

interface DeliverySettingRaw {
  method: string;
  enabled: boolean;
  fee: number;
  instructions: string | null;
  locationDetails: string | null;
}

interface AboutSettingRaw {
  title: string;
  subtitle: string;
  content: string;
  image: string;
}

interface SettingsFormProps {
  abuja: DeliverySettingRaw | null;
  nationwide: DeliverySettingRaw | null;
  about: AboutSettingRaw | null;
}

export default function SettingsForm({ abuja, nationwide, about }: SettingsFormProps) {
  const router = useRouter();

  // Abuja states
  const [abujaEnabled, setAbujaEnabled] = useState(abuja ? abuja.enabled : true);
  const [abujaFee, setAbujaFee] = useState(abuja ? abuja.fee.toString() : "0");
  const [abujaInstructions, setAbujaInstructions] = useState(
    abuja?.instructions || ""
  );
  const [abujaLocation, setAbujaLocation] = useState(
    abuja?.locationDetails || ""
  );

  // Nationwide states
  const [nationwideEnabled, setNationwideEnabled] = useState(
    nationwide ? nationwide.enabled : true
  );
  const [nationwideFee, setNationwideFee] = useState(
    nationwide ? nationwide.fee.toString() : "4500"
  );
  const [nationwideInstructions, setNationwideInstructions] = useState(
    nationwide?.instructions || ""
  );

  // About Page states
  const [aboutTitle, setAboutTitle] = useState(about ? about.title : "many good things");
  const [aboutSubtitle, setAboutSubtitle] = useState(about ? about.subtitle : "Our Story");
  const [aboutContent, setAboutContent] = useState(about ? about.content : "");
  const [aboutImage, setAboutImage] = useState(about ? about.image : "/logo-colors.jpg");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abujaEnabled,
          abujaFee: parseFloat(abujaFee) || 0,
          abujaInstructions,
          abujaLocation,
          nationwideEnabled,
          nationwideFee: parseFloat(nationwideFee) || 0,
          nationwideInstructions,
          aboutTitle,
          aboutSubtitle,
          aboutContent,
          aboutImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl">
      
      {/* Save Button Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-brand-burgundy">Boutique Configuration</h1>
          <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50 mt-1">
            Configure delivery fees, showroom pickup details, and brand pages
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-5 py-3.5 font-medium hover:bg-brand-burgundy/90 transition-colors shadow-sm self-start disabled:opacity-50"
        >
          <Save className="h-4.5 w-4.5" />
          <span>{loading ? "Saving…" : "Save Configurations"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-brand-burgundy/5 border border-brand-burgundy/10 text-brand-burgundy text-xs uppercase tracking-widest font-light text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-brand-olive/15 border border-brand-olive/30 text-brand-olive text-xs uppercase tracking-widest font-medium flex items-center justify-center space-x-2">
          <Check className="h-4 w-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Grid: Delivery Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-light text-brand-charcoal/80">
        
        {/* ABUJA PICKUP COLUMN */}
        <div className="bg-brand-cream border border-brand-burgundy/10 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-brand-burgundy/5 pb-2">
            <h2 className="font-serif text-lg text-brand-burgundy">Abuja Showroom Pickup</h2>
            <label className="flex items-center space-x-2 text-xs uppercase tracking-wider text-brand-charcoal/60 font-bold cursor-pointer">
              <span>Enabled</span>
              <input
                type="checkbox"
                checked={abujaEnabled}
                onChange={(e) => setAbujaEnabled(e.target.checked)}
                className="accent-brand-burgundy"
              />
            </label>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Pickup Fee (₦ Naira)</label>
            <input
              type="number"
              disabled={!abujaEnabled}
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy disabled:opacity-50"
              value={abujaFee}
              onChange={(e) => setAbujaFee(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Showroom Address Details</label>
            <input
              type="text"
              disabled={!abujaEnabled}
              placeholder="e.g. Suite 12, Olive Plaza, Wuse II"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy disabled:opacity-50"
              value={abujaLocation}
              onChange={(e) => setAbujaLocation(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Pickup Instructions</label>
            <textarea
              rows={4}
              disabled={!abujaEnabled}
              placeholder="Provide collection working hours and what clients should bring…"
              className="bg-transparent border border-brand-burgundy/20 p-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy disabled:opacity-50"
              value={abujaInstructions}
              onChange={(e) => setAbujaInstructions(e.target.value)}
            />
          </div>
        </div>

        {/* NATIONWIDE DELIVERY COLUMN */}
        <div className="bg-brand-cream border border-brand-burgundy/10 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-brand-burgundy/5 pb-2">
            <h2 className="font-serif text-lg text-brand-burgundy">Nationwide Delivery</h2>
            <label className="flex items-center space-x-2 text-xs uppercase tracking-wider text-brand-charcoal/60 font-bold cursor-pointer">
              <span>Enabled</span>
              <input
                type="checkbox"
                checked={nationwideEnabled}
                onChange={(e) => setNationwideEnabled(e.target.checked)}
                className="accent-brand-burgundy"
              />
            </label>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Delivery Fee (₦ Naira)</label>
            <input
              type="number"
              disabled={!nationwideEnabled}
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy disabled:opacity-50"
              value={nationwideFee}
              onChange={(e) => setNationwideFee(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Shipping Instructions</label>
            <textarea
              rows={7}
              disabled={!nationwideEnabled}
              placeholder="Detail parcel shipping regions, carrier companies, and standard transit times…"
              className="bg-transparent border border-brand-burgundy/20 p-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy disabled:opacity-50"
              value={nationwideInstructions}
              onChange={(e) => setNationwideInstructions(e.target.value)}
            />
          </div>
        </div>

      </div>

      {/* About Page Configuration Block */}
      <div className="bg-brand-cream border border-brand-burgundy/10 p-6 sm:p-8 shadow-sm space-y-6 text-sm font-light text-brand-charcoal/80">
        <div className="border-b border-brand-burgundy/5 pb-2">
          <h2 className="font-serif text-lg text-brand-burgundy">About Page Story Details</h2>
          <p className="text-xs text-brand-charcoal/50 mt-1">Configure company background details and values</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Story Title</label>
            <input
              type="text"
              required
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Story Subtitle / Eyebrow</label>
            <input
              type="text"
              required
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={aboutSubtitle}
              onChange={(e) => setAboutSubtitle(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Featured Story Image URL / Path</label>
          <input
            type="text"
            required
            className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
            value={aboutImage}
            onChange={(e) => setAboutImage(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Story Content paragraphs (Separate paragraphs with double newlines)</label>
          <textarea
            rows={10}
            required
            placeholder="Type paragraphs of the story. Separate paragraphs using empty lines..."
            className="bg-transparent border border-brand-burgundy/20 p-3 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy leading-relaxed"
            value={aboutContent}
            onChange={(e) => setAboutContent(e.target.value)}
          />
        </div>
      </div>

    </form>
  );
}
