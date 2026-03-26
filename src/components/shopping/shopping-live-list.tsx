"use client";

import { useState, useCallback } from "react";
import { BarcodeScanner } from "./barcode-scanner";
import { formatCurrency as fmt } from "@/lib/utils";

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

type PriceType = "unit" | "weight" | "fixed";

const round2 = (n: number) => Math.round(n * 100) / 100;

export function ShoppingLiveList({ sessionId, storeId, initialItems, initialTotal }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);
  const [prefill, setPrefill] = useState<{ name: string; price: number; productId: string | null }>({ name: "", price: 0, productId: null });

  // Add item form state
  const [priceType, setPriceType] = useState<PriceType>("unit");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [weightKg, setWeightKg] = useState("");

  const total = items.reduce((s, i) => s + i.estimatedPrice * i.quantity, 0);

  const calculatedTotal = (() => {
    const price = Number(unitPrice) || 0;
    if (priceType === "unit") return round2(price * (Number(quantity) || 1));
    if (priceType === "weight") return round2(price * (Number(weightKg) || 0));
    return price; // fixed
  })();

  const handleBarcodeScan = useCallback(async (barcode: string) => {
    setCameraOpen(false);
    setScannedBarcode(barcode);
    setLoading(true);
    try {
      const res = await fetch(`/api/products/lookup?barcode=${encodeURIComponent(barcode)}&storeId=${encodeURIComponent(storeId)}`);
      const result = await res.json();
      if (result.found) {
        setPrefill({ name: result.name, price: result.price ?? 0, productId: result.productId });
        setUnitPrice(result.price ? String(result.price) : "");
      } else {
        setPrefill({ name: "", price: 0, productId: null });
        setUnitPrice("");
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

  function resetForm() {
    setManualMode(false);
    setScannedBarcode(null);
    setShowBarcodeInput(false);
    setPrefill({ name: "", price: 0, productId: null });
    setPriceType("unit");
    setUnitPrice("");
    setQuantity("1");
    setWeightKg("");
  }

  function openManualAdd() {
    resetForm();
    setManualMode(true);
  }

  async function handleAddItem(formData: FormData) {
    const name = formData.get("name") as string;
    if (!name || calculatedTotal <= 0) return;

    // For unit: save unit price + quantity. For weight/fixed: save total + qty 1
    const savePrice = priceType === "unit" ? (Number(unitPrice) || 0) : calculatedTotal;
    const saveQty = priceType === "unit" ? (Number(quantity) || 1) : 1;
    const notes = priceType === "weight"
      ? `${weightKg}kg a ${fmt(Number(unitPrice))}/kg`
      : (formData.get("notes") as string) || undefined;

    setLoading(true);
    try {
      const res = await fetch("/api/shopping/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name,
          barcode: scannedBarcode ?? undefined,
          estimatedPrice: savePrice,
          quantity: saveQty,
          notes,
          productId: prefill.productId ?? undefined,
        }),
      });
      const { id } = await res.json();
      setItems((prev) => [...prev, {
        id,
        productId: prefill.productId,
        name,
        barcode: scannedBarcode,
        estimatedPrice: savePrice,
        finalPrice: null,
        quantity: saveQty,
        notes: notes ?? null,
      }]);
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await fetch("/api/shopping/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
  }

  async function handleUpdatePrice(itemId: string, newPrice: number) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, estimatedPrice: newPrice } : i)));
    setEditingId(null);
    await fetch("/api/shopping/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, estimatedPrice: newPrice }),
    });
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

      {/* Camera scanner — mobile only (or dev) */}
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
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 md:hidden"
          >
            📷 Escanear código de barras
          </button>
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() => setCameraOpen(true)}
              className="hidden w-full rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted md:block"
            >
              📷 Escanear (dev only)
            </button>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Buscar por código de barras"
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
            onClick={openManualAdd}
            className="w-full rounded-md border px-4 py-2 text-sm hover:bg-muted"
          >
            + Agregar producto
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

          {/* Barcode (optional) */}
          {!scannedBarcode && (
            showBarcodeInput ? (
              <input
                type="text"
                inputMode="numeric"
                placeholder="Código de barras (opcional)"
                value={scannedBarcode ?? ""}
                onChange={(e) => setScannedBarcode(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowBarcodeInput(true)}
                className="text-xs text-primary hover:underline"
              >
                + Agregar código de barras
              </button>
            )
          )}

          {/* Price type selector */}
          <div className="flex gap-1 rounded-md border p-1">
            {([
              ["unit", "Por unidad"],
              ["weight", "Por peso"],
              ["fixed", "Precio fijo"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriceType(value)}
                className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${priceType === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Price inputs based on type */}
          {priceType === "unit" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Precio unitario</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {priceType === "weight" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Precio por kg</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Peso (kg)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="ej: 0.5"
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {priceType === "fixed" && (
            <div>
              <label className="text-xs text-muted-foreground">Precio total</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0.00"
                required
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          )}

          {priceType !== "fixed" && (
            <input name="notes" placeholder="Notas (opcional)" className="w-full rounded-md border px-3 py-2 text-sm" />
          )}

          {/* Calculated total */}
          {calculatedTotal > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm font-semibold">{fmt(calculatedTotal)}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || calculatedTotal <= 0}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Agregando..." : "Agregar"}
            </button>
            <button
              type="button"
              onClick={resetForm}
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
                {item.notes && <span>{item.quantity > 1 ? "· " : ""}{item.notes}</span>}
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
