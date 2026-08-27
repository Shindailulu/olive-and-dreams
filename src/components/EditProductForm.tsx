"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface VariantInput {
  size: string;
  color: string;
  stock: number;
}

interface EditProductVariant {
  id: number;
  size: string;
  color: string;
  stock: number;
  sku: string | null;
}

interface EditProductProps {
  product: {
    id: number;
    name: string;
    slug: string;
    description: string;
    category: string;
    price: number;
    images: string;
    material: string | null;
    fit: string | null;
    careInstructions: string | null;
    sizeGuide: string | null;
    variants: EditProductVariant[];
  };
}

export default function EditProductForm({ product }: EditProductProps) {
  const router = useRouter();

  // Basic Information
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description);
  const [category, setCategory] = useState(product.category);
  const [price, setPrice] = useState(product.price.toString());
  const [images, setImages] = useState(product.images);
  const [uploading, setUploading] = useState(false);

  // Specs
  const [material, setMaterial] = useState(product.material || "");
  const [fit, setFit] = useState(product.fit || "");
  const [careInstructions, setCareInstructions] = useState(product.careInstructions || "");
  const [sizeGuide, setSizeGuide] = useState(product.sizeGuide || "");

  // Variant States
  const [colors, setColors] = useState<string[]>(() =>
    Array.from(new Set(product.variants.map((v) => v.color)))
  );
  const [newColor, setNewColor] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() =>
    Array.from(new Set(product.variants.map((v) => v.size)))
  );

  const availableSizes = ["XS", "S", "M", "L", "XL"];

  // Dynamic variants grid state
  const [variants, setVariants] = useState<VariantInput[]>(() =>
    product.variants.map((v) => ({
      size: v.size,
      color: v.color,
      stock: v.stock,
    }))
  );

  const isInitialMount = useRef(true);

  // Regenerate variants grid when colors or sizes change (skip initial mount to preserve stock numbers)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newVariants: VariantInput[] = [];
    colors.forEach((color) => {
      selectedSizes.forEach((size) => {
        // Try to keep previous stock if it existed
        const prev = variants.find((v) => v.size === size && v.color === color);
        newVariants.push({
          size,
          color,
          stock: prev ? prev.stock : 10, // default stock
        });
      });
    });
    setVariants(newVariants);
  }, [colors, selectedSizes]);

  // Sync slug on name change only if user touches it
  const isNameChanged = useRef(false);
  useEffect(() => {
    if (isNameChanged.current) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    } else {
      isNameChanged.current = true;
    }
  }, [name]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()]);
      setNewColor("");
    }
  };

  const handleRemoveColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleStockChange = (index: number, val: number) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, stock: Math.max(0, val) } : v))
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setImages(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (targetStatus: string) => {
    if (!name || !slug || !description || !price) {
      setError("Please fill out all basic details.");
      return;
    }

    if (variants.length === 0) {
      setError("Please add at least one color and size variant.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          name,
          slug,
          description,
          category,
          price: parseFloat(price),
          images,
          material,
          fit,
          careInstructions,
          sizeGuide,
          status: targetStatus,
          variants: variants.map((v) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: `${slug.substring(0, 3).toUpperCase()}-${v.color.substring(0, 3).toUpperCase()}-${v.size}`,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-10 max-w-4xl">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <Link href="/admin/products" className="inline-flex items-center text-xs uppercase tracking-widest text-brand-burgundy hover:text-brand-olive transition-colors font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
          </Link>
          <h1 className="font-serif text-3xl text-brand-burgundy mt-2">Edit Product</h1>
        </div>
        <div className="flex items-center space-x-3 self-start">
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={loading}
            className="inline-flex items-center space-x-2 border border-brand-burgundy/20 text-brand-burgundy bg-transparent text-xs uppercase tracking-widest px-5 py-3 font-medium hover:bg-brand-burgundy/5 transition-colors shadow-sm disabled:opacity-50"
          >
            <span>Save as Draft</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-5 py-3.5 font-medium hover:bg-brand-burgundy/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{loading ? "Saving…" : "Publish"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-brand-burgundy/5 border border-brand-burgundy/10 text-brand-burgundy text-xs uppercase tracking-widest font-light text-center leading-relaxed">
          {error}
        </div>
      )}

      {/* Grid structure */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-sm font-light text-brand-charcoal/80">
        
        {/* Core fields (Col 8) */}
        <div className="md:col-span-8 space-y-8 bg-brand-cream border border-brand-burgundy/10 p-6 sm:p-8 shadow-sm">
          
          <h2 className="font-serif text-lg text-brand-burgundy border-b border-brand-burgundy/5 pb-2">1. Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1">
              <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jeje Linen Midi Dress"
                className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">URL Slug *</label>
              <input
                type="text"
                required
                placeholder="e.g. jeje-linen-midi-dress"
                className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Provide a luxurious description detailing material qualities and silhoutte feel…"
              className="bg-transparent border border-brand-burgundy/20 p-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1">
              <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Category *</label>
              <select
                className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Dresses">Dresses</option>
                <option value="Tops">Tops</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Price (₦ Naira) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 45000"
                className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Product Image *</label>
            <div className="flex items-center space-x-6">
              <div className="relative h-24 w-24 border border-brand-burgundy/10 bg-brand-cream flex items-center justify-center overflow-hidden">
                {images ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-brand-charcoal/40">No Image</span>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  id="product-image-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="product-image-upload"
                  className="inline-block bg-brand-burgundy/10 hover:bg-brand-burgundy/20 text-brand-burgundy text-xs uppercase tracking-widest px-4 py-2.5 font-medium transition-colors cursor-pointer text-center"
                >
                  {uploading ? "Uploading…" : "Upload from Gallery"}
                </label>
                <span className="text-[10px] text-brand-charcoal/50">Supports JPG, PNG, GIF up to 5MB</span>
              </div>
            </div>
          </div>

          <h2 className="font-serif text-lg text-brand-burgundy border-b border-brand-burgundy/5 pb-2 pt-6">2. Material & Care</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1">
              <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Fabric / Material</label>
              <input
                type="text"
                placeholder="e.g. 100% Linen"
                className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Fit description</label>
              <input
                type="text"
                placeholder="e.g. Bias-cut silhouette, hugs curves"
                className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                value={fit}
                onChange={(e) => setFit(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1">
              <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Care Instructions</label>
              <input
                type="text"
                placeholder="e.g. Hand wash cold or dry clean"
                className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs uppercase tracking-wider text-brand-charcoal/60">Size Guide Table Reference</label>
              <input
                type="text"
                placeholder="e.g. S: Bust 34, Waist 27 | M: Bust 36"
                className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                value={sizeGuide}
                onChange={(e) => setSizeGuide(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* Variants configuration (Col 4) */}
        <div className="md:col-span-4 space-y-8 bg-brand-cream border border-brand-burgundy/10 p-6 shadow-sm self-start">
          
          <h2 className="font-serif text-lg text-brand-burgundy border-b border-brand-burgundy/5 pb-2">3. Variants & Stock</h2>

          {/* Color Selector */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-brand-charcoal/60 font-bold">Colors</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {colors.map((c) => (
                <span
                  key={c}
                  className="bg-brand-burgundy text-brand-cream text-xs px-2.5 py-1 rounded-full flex items-center space-x-1 font-sans"
                >
                  <span>{c}</span>
                  <button type="button" onClick={() => handleRemoveColor(c)} className="hover:opacity-75 focus:outline-none ml-1">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add color (e.g. Wine)"
                className="bg-transparent border-b border-brand-burgundy/20 py-1 text-xs tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy flex-grow"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddColor();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="bg-brand-burgundy/10 hover:bg-brand-burgundy/20 text-brand-burgundy px-3 py-1 text-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-brand-charcoal/60 font-bold">Sizes</label>
            <div className="flex gap-2">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSizeToggle(s)}
                  className={`text-xs px-3 py-1.5 border transition-colors ${selectedSizes.includes(s) ? "border-brand-burgundy bg-brand-burgundy text-brand-cream" : "border-brand-burgundy/10 hover:border-brand-burgundy text-brand-charcoal/70"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Variants stock grid */}
          <div className="space-y-3 pt-4 border-t border-brand-burgundy/10">
            <span className="block text-xs uppercase tracking-wider text-brand-charcoal/60 font-bold">Stock Levels</span>
            {variants.length > 0 ? (
              <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                {variants.map((v, index) => (
                  <div key={index} className="flex justify-between items-center text-xs font-sans">
                    <span className="font-serif text-brand-burgundy">{v.color} / {v.size}</span>
                    <input
                      type="number"
                      className="w-16 bg-transparent border border-brand-burgundy/20 text-center py-1 text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                      value={v.stock}
                      onChange={(e) => handleStockChange(index, parseInt(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-brand-charcoal/50 italic">Add colors and sizes to configure inventory.</p>
            )}
          </div>

          {/* Removed status selector from sidebar */}
        </div>

      </div>

      {/* Bottom CTA Actions */}
      <div className="flex justify-end items-center space-x-4 pt-6 border-t border-brand-burgundy/10">
        <Link
          href="/admin/products"
          className="text-xs uppercase tracking-widest text-brand-charcoal/60 hover:text-brand-burgundy transition-colors font-medium py-3 px-4"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={() => handleSave("DRAFT")}
          disabled={loading}
          className="inline-flex items-center space-x-2 border border-brand-burgundy/20 text-brand-burgundy bg-transparent text-xs uppercase tracking-widest px-6 py-3.5 font-medium hover:bg-brand-burgundy/5 transition-colors shadow-sm disabled:opacity-50"
        >
          <span>Save as Draft</span>
        </button>
        <button
          type="button"
          onClick={() => handleSave("PUBLISHED")}
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-6 py-3.5 font-medium hover:bg-brand-burgundy/90 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="h-4.5 w-4.5" />
          <span>{loading ? "Saving…" : "Publish"}</span>
        </button>
      </div>
    </form>
  );
}
