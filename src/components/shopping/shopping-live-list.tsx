"use client";

import { useState, useRef, useCallback } from "react";
import { addShoppingItem, updateShoppingItem, removeShoppingItem, lookupProduct } from "@/lib/actions/shopping";
import { BarcodeScanner } from "./barcode-scanner";

interface Item {
  id: string;
  productId: string | null;
  name: string;
  barcode: string | null;
  estimatedPrice: number;
  finalPrice: number | null;
  quantity: number;
  notes: string | null;
}

interface Props {
  sessionId: string;
  storeId: string;
  initialItems: Item[];
  initialTotal: number;
}

const fmt = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

export function ShoppingLiveList({ sessionId, storeId, initialItems, initialTotal }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<{ name: string; price: number; productId: string | null }>({ name: "", price: 0, productId: null });

  const total = items.reduce((s, i) => s + i.estimatedPrice * i.quantity, 0);

  const handleBarcodeScan = useCallback(async (barcode: string) => {
    setCameraOpen(false);
    setScannedBarcode(barcode);
    setLoading(true);
    try {
      const result = await lookupProduct(barcode, storeId);
      if (result.found) {
        setPrefill({ name: result.name, price: result.price ?? 0, productId: result.productId });
      } else {
        setPrefill({ name: "", price: 0, productId: null });
      }
      setManualMode(true);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  async function handleManualBarcode() {
    const barcode = scannedBarcode?.trim();
    if (!barcode) return;
    await handleBarcodeScan(barcode);
  }

  async function handleAddItem(formData: FormData) {
    const name = formData.get("name") as string;
    const estimatedPrice = Number(formData.get("estimatedPrice"));
    const quantity = Number(formData.get("quantity") || 1);
    const notes = (formData.get("notes") as string) || undefined;

    setLoading(true);
    try {
      await addShoppingItem(sessionId, {
        name,
        barcode: scannedBarcode ?? undefined,
        estimatedPrice,
        quantity,
        notes,
        productId: prefill.productId ?? undefined,
      });
      const newItem: Item = {
        id: crypto.randomUUID(),
        productId: prefill.productId,
        name,
        barcode: scannedBarcode,
        estimatedPrice,
        finalPrice: null,
        quantity,
        notes: notes ?? null,
      };
      setItems((prev) => [...prev, newItem]);
      setManualMode(false);
      setScannedBarcode(null);
      setPrefill({ name: "", price: 0, productId: null });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await removeShoppingItem(itemId);
  }

  async function handleUpdatePrice(itemId: string, newPrice: number) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, estimatedPrice: newPrice } : i)));
    setEditingId(null);
    await updateShoppingItem(itemId, { estimatedPrice: newPrice });
  }

  return (
    <div className="space-y-4">
      {/* Running total */}
      <div className="sticky top-0 z-10 rounded-xl border bg-background p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total estimado</p>
            <p className="text-2xl font-bold">{fmt(total)}</p>
          </div>
          <span className="text-sm text-muted-foreground">{items.length} productos</span>
        </div>
      </div>

      {/* Camera scanner */}
      {cameraOpen && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Scan / Add controls */}
      {!manualMode && !cameraOpen && (
        <div className="space-y-3">
          <button
            onClick={() => setCameraOpen(true)}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            📷 Escanear código de barras
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="O escribe el código manualmente"
              value={scannedBarcode ?? ""}
              onChange={(e) => setScannedBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualBarcode()}
              className="flex-1 rounded-md border px-3 py-2 text-sm"
            />
            <button
              onClick={handleManualBarcode}
              disabled={loading || !scannedBarcode?.trim()}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
            >
              {loading ? "..." : "Buscar"}
            </button>
          </div>
          <button
            onClick={() => { setManualMode(true); setScannedBarcode(null); setPrefill({ name: "", price: 0, productId: null }); }}
            className="w-full rounded-md border px-4 py-2 text-sm hover:bg-muted"
          >
            + Agregar producto sin código
          </button>
        </div>
      )}

      {/* Add item form */}
      {manualMode && (
        <form action={handleAddItem} className="space-y-3 rounded-xl border p-4">
          <p className="text-sm font-medium">
            {prefill.productId ? "✅ Producto encontrado" : "Agregar producto"}
          </p>
          {scannedBarcode && (
            <p className="text-xs text-muted-foreground">Código: {scannedBarcode}</p>
          )}
          <input
            name="name"
            defaultValue={prefill.name}
            placeholder="Nombre del producto"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Precio</label>
              <input
                name="estimatedPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={prefill.price || ""}
                placeholder="0.00"
                required
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Cantidad</label>
              <input
                name="quantity"
                type="number"
                min="1"
                defaultValue={1}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <input
            name="notes"
            placeholder="Notas (ej: aprox 1.5kg)"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Agregando..." : "Agregar"}
            </button>
            <button
              type="button"
              onClick={() => { setManualMode(false); setScannedBarcode(null); setPrefill({ name: "", price: 0, productId: null }); }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                {item.quantity > 1 && <span>×{item.quantity}</span>}
                {item.notes && <span>· {item.notes}</span>}
              </div>
            </div>
            {editingId === item.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = Number(new FormData(e.currentTarget).get("price"));
                  if (val >= 0) handleUpdatePrice(item.id, val);
                }}
                className="flex gap-1"
              >
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={item.estimatedPrice}
                  className="w-20 rounded border px-2 py-1 text-sm"
                  autoFocus
                />
                <button type="submit" className="text-xs text-primary">✓</button>
              </form>
            ) : (
              <button
                onClick={() => setEditingId(item.id)}
                className="text-sm font-semibold hover:text-primary"
                title="Editar precio"
              >
                {fmt(item.estimatedPrice * item.quantity)}
              </button>
            )}
            <button
              onClick={() => handleRemove(item.id)}
              className="text-muted-foreground hover:text-destructive text-lg"
              title="Eliminar"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
