"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MoreVertical, Edit2, Trash2, Globe } from "lucide-react";
import { handleDeleteProduct, handlePublishProduct } from "@/app/admin/products/actions";

interface ProductActionsDropdownProps {
  productId: number;
  productName: string;
  status: string; // DRAFT or PUBLISHED
}

export default function ProductActionsDropdown({
  productId,
  productName,
  status,
}: ProductActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`Are you sure you want to completely delete "${productName}"?`)) {
      e.preventDefault();
    } else {
      setIsOpen(false);
    }
  };

  const handlePublishSubmit = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* 3-dots button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-brand-charcoal/60 hover:text-brand-burgundy p-2 hover:bg-brand-burgundy/5 transition-all"
        aria-label="Product Actions"
        type="button"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-brand-cream border border-brand-burgundy/10 shadow-lg z-30 py-1.5 focus:outline-none animate-fade-in font-sans text-xs">
          
          {/* Quick Publish for Drafts */}
          {status === "DRAFT" && (
            <form action={handlePublishProduct} onSubmit={handlePublishSubmit}>
              <input type="hidden" name="productId" value={productId} />
              <button
                type="submit"
                className="w-full text-left px-4 py-2 hover:bg-brand-burgundy/5 text-brand-olive font-medium flex items-center space-x-2"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Publish</span>
              </button>
            </form>
          )}

          {/* Edit Option */}
          <Link
            href={`/admin/products/edit/${productId}`}
            onClick={() => setIsOpen(false)}
            className="w-full text-left px-4 py-2 hover:bg-brand-burgundy/5 text-brand-charcoal flex items-center space-x-2"
          >
            <Edit2 className="h-3.5 w-3.5 text-brand-charcoal/60" />
            <span>Edit Product</span>
          </Link>

          {/* Divider */}
          <div className="border-t border-brand-burgundy/5 my-1" />

          {/* Delete Option */}
          <form action={handleDeleteProduct} onSubmit={handleDeleteSubmit}>
            <input type="hidden" name="productId" value={productId} />
            <button
              type="submit"
              className="w-full text-left px-4 py-2 hover:bg-brand-burgundy/5 text-brand-burgundy flex items-center space-x-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
