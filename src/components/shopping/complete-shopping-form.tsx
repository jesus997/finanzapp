"use client";

import { useState } from "react";
import { completeShoppingSession } from "@/lib/actions/shopping";
import { getOcrProvider } from "@/lib/ocr";
import { PAYMENT_METHOD_TYPE_LABELS } from "@/lib/constants";

interface Item {
  id: string;
  name: string;
  estimatedPrice: number;
  quantity: number;
}

interface PaymentOption {
  type: string;
  id: string;
  label: string;
}

interface Props {
  sessionId: string;
  items: Item[];
  paymentOptions: PaymentOption[];
}

const fmt = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

export function CompleteShoppingForm({ sessionId, items, paymentOptions }: Props) {
  const [finalPrices, setFinalPrices] = useState<Record<string, number>>(
    Object.fromEntries(items.map((i) => [i.id, i.estimatedPrice * i.quantity]))
  );
  const [paymentType, setPaymentType] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const estimatedTotal = items.reduce((s, i) => s + i.estimatedPrice * i.quantity, 0);
  const finalTotal = Object.values(finalPrices).reduce((s, p) => s + p, 0);
  const diff = finalTotal - estimatedTotal;

  async function handleTicketScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const provider = getOcrProvider();
      const { text } = await provider.extractText(file);
      // Try to extract prices from ticket lines
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      for (const item of items) {
        for (const line of lines) {
          const nameMatch = item.name.split(" ")[0]?.toLowerCase();
          if (nameMatch && line.toLowerCase().includes(nameMatch)) {
            const priceMatch = line.match(/\$?\s*([\d,]+\.\d{2})/);
            if (priceMatch) {
              const price = parseFloat(priceMatch[1].replace(/,/g, ""));
              setFinalPrices((prev) => ({ ...prev, [item.id]: price }));
            }
          }
        }
      }
    } catch {
      // OCR failed — user can still enter manually
    } finally {
      setScanning(false);
    }
  }

  async function handleSubmit() {
    if (!paymentType || !paymentId) return;
    setLoading(true);
    await completeShoppingSession(sessionId, {
      paymentMethodType: paymentType,
      paymentMethodId: paymentId,
      finalItems: items.map((i) => ({
        itemId: i.id,
        finalPrice: finalPrices[i.id] ?? i.estimatedPrice * i.quantity,
      })),
    });
  }

  const filteredOptions = paymentOptions.filter((o) => o.type === paymentType);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Completar compra</h2>

      {/* Ticket scan */}
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-sm font-medium">📷 Escanear ticket (opcional)</p>
        <p className="text-xs text-muted-foreground">
          Toma una foto del ticket para actualizar los precios reales automáticamente
        </p>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleTicketScan}
          disabled={scanning}
          className="text-sm"
        />
        {scanning && <p className="text-xs text-muted-foreground">Procesando ticket...</p>}
      </div>

      {/* Price reconciliation */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Precios finales</p>
        {items.map((item) => {
          const estimated = item.estimatedPrice * item.quantity;
          const final_ = finalPrices[item.id] ?? estimated;
          const itemDiff = final_ - estimated;
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">Estimado: {fmt(estimated)}</p>
              </div>
              <input
                type="number"
                step="0.01"
                value={final_}
                onChange={(e) => setFinalPrices((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                className="w-24 rounded border px-2 py-1 text-sm text-right"
              />
              {itemDiff !== 0 && (
                <span className={`text-xs ${itemDiff > 0 ? "text-destructive" : "text-green-600"}`}>
                  {itemDiff > 0 ? "+" : ""}{fmt(itemDiff)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="rounded-xl border p-4 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimado</span>
          <span>{fmt(estimatedTotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>Total final</span>
          <span>{fmt(finalTotal)}</span>
        </div>
        {diff !== 0 && (
          <div className={`flex justify-between text-xs ${diff > 0 ? "text-destructive" : "text-green-600"}`}>
            <span>Diferencia</span>
            <span>{diff > 0 ? "+" : ""}{fmt(diff)}</span>
          </div>
        )}
      </div>

      {/* Payment method */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Método de pago</p>
        <select
          value={paymentType}
          onChange={(e) => { setPaymentType(e.target.value); setPaymentId(""); }}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Seleccionar tipo</option>
          {Object.entries(PAYMENT_METHOD_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {paymentType && (
          <select
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Seleccionar</option>
            {filteredOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !paymentType || !paymentId}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Completar compra"}
      </button>
    </div>
  );
}
