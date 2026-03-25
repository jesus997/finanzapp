"use client";

import { useState } from "react";
import { updateProduct, deleteProduct } from "@/lib/actions/admin";

interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string | null;
  description: string | null;
  source: string;
  priceCount: number;
}

export function AdminProductList({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSave(id: string, form: FormData) {
    setLoading(true);
    try {
      const data = {
        name: form.get("name") as string,
        brand: (form.get("brand") as string) || undefined,
        description: (form.get("description") as string) || undefined,
      };
      await updateProduct(id, data);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data, brand: data.brand ?? null, description: data.description ?? null } : p)),
      );
      setEditingId(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto del catálogo global?")) return;
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const sourceLabel: Record<string, string> = {
    OPEN_FOOD_FACTS: "OFF",
    MANUAL: "Manual",
  };

  return (
    <div className="space-y-2">
      {products.map((p) => (
        <div key={p.id} className="rounded-xl border p-4">
          {editingId === p.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(p.id, new FormData(e.currentTarget));
              }}
              className="space-y-2"
            >
              <input name="name" defaultValue={p.name} required className="w-full rounded-md border px-3 py-1.5 text-sm" placeholder="Nombre" />
              <input name="brand" defaultValue={p.brand ?? ""} className="w-full rounded-md border px-3 py-1.5 text-sm" placeholder="Marca (opcional)" />
              <textarea name="description" defaultValue={p.description ?? ""} className="w-full rounded-md border px-3 py-1.5 text-sm" placeholder="Descripción (opcional)" rows={2} />
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50">
                  {loading ? "..." : "Guardar"}
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="rounded-md border px-3 py-1 text-xs hover:bg-muted">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{p.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{p.barcode}</span>
                  {p.brand && <span>{p.brand}</span>}
                  <span>{sourceLabel[p.source] ?? p.source}</span>
                  <span>{p.priceCount} precio{p.priceCount !== 1 ? "s" : ""}</span>
                </div>
                {p.description && <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditingId(p.id)} className="rounded-md border px-2 py-1 text-xs hover:bg-muted">
                  Editar
                </button>
                <button onClick={() => handleDelete(p.id)} className="rounded-md border px-2 py-1 text-xs text-destructive hover:bg-destructive/10">
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {products.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay productos en el catálogo.</p>
      )}
    </div>
  );
}
