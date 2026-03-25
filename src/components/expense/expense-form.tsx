"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { createExpense, updateExpense } from "@/lib/actions/expense";
import { getOcrProvider } from "@/lib/ocr";
import { parseReceipt } from "@/lib/utils/receipt-parser";

interface CardOption {
  id: string;
  name: string;
  type: string;
  lastFourDigits: string;
}

interface IncomeSourceOption {
  id: string;
  name: string;
}

interface Props {
  cards: CardOption[];
  incomeSources: IncomeSourceOption[];
  expense?: {
    id: string;
    name: string;
    description: string | null;
    amount: number;
    date: string;
    category: string | null;
    paymentMethodType: string;
    paymentMethodId: string;
  };
}

export function ExpenseForm({ cards, incomeSources, expense }: Props) {
  const router = useRouter();
  const [name, setName] = useState(expense?.name ?? "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? "");
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(expense?.category ?? "");
  const [paymentMethodType, setPaymentMethodType] = useState(expense?.paymentMethodType ?? "");
  const [paymentMethodId, setPaymentMethodId] = useState(expense?.paymentMethodId ?? "");
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const paymentOptions = paymentMethodType === "INCOME_SOURCE"
    ? incomeSources.map((s) => ({ id: s.id, label: s.name }))
    : cards
        .filter((c) => (paymentMethodType === "CREDIT_CARD" ? c.type === "CREDIT" : c.type === "DEBIT"))
        .map((c) => ({ id: c.id, label: `${c.name} ••••${c.lastFourDigits}` }));

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    try {
      const provider = getOcrProvider();
      const { text } = await provider.extractText(file);
      const parsed = parseReceipt(text);
      if (parsed.storeName) setName(parsed.storeName);
      if (parsed.total) setAmount(parsed.total.toString());
      if (parsed.date) setDate(parsed.date);
    } catch {
      // OCR failed silently — user fills manually
    } finally {
      setScanning(false);
    }
  };

  const action = expense
    ? updateExpense.bind(null, expense.id)
    : createExpense;

  return (
    <form action={action} className="max-w-md space-y-4">
      {/* Scan button */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleScan}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={scanning}
          onClick={() => fileRef.current?.click()}
        >
          {scanning ? "Escaneando ticket..." : "📷 Escanear ticket"}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          Toma una foto del ticket para pre-llenar nombre, monto y fecha automáticamente.
        </p>
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          Toma una foto del ticket para llenar automáticamente
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input id="amount" name="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input id="date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label>Categoría (opcional)</Label>
        <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
          <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
          <SelectContent>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="category" value={category} />
      </div>

      <div className="space-y-2">
        <Label>Método de pago</Label>
        <Select value={paymentMethodType} onValueChange={(v) => { setPaymentMethodType(v ?? ""); setPaymentMethodId(""); }}>
          <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="CREDIT_CARD">Tarjeta de crédito</SelectItem>
            <SelectItem value="DEBIT_CARD">Tarjeta de débito</SelectItem>
            <SelectItem value="INCOME_SOURCE">Fuente de ingreso</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="paymentMethodType" value={paymentMethodType} />
      </div>

      {paymentMethodType && (
        <div className="space-y-2">
          <Label>Cuenta / Tarjeta</Label>
          <Select value={paymentMethodId} onValueChange={(v) => setPaymentMethodId(v ?? "")}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {paymentOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="paymentMethodId" value={paymentMethodId} />
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {expense ? "Guardar cambios" : "Registrar gasto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
