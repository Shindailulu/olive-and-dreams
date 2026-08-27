"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { handleDeleteProduct } from "@/app/admin/products/actions";

interface DeleteProductButtonProps {
  productId: number;
  productName: string;
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`Are you sure you want to delete ${productName}?`)) {
      e.preventDefault();
    }
  };

  return (
    <form action={handleDeleteProduct} onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        className="text-brand-burgundy/60 hover:text-brand-burgundy p-2 transition-colors"
        aria-label={`Delete ${productName}`}
      >
        <Trash2 className="h-4.5 w-4.5" />
      </button>
    </form>
  );
}
