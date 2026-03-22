"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FREQUENCY_LABELS,
  PAYMENT_METHOD_TYPE_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from "@/lib/constants";
import { createRecurringExpense, updateRecurringExpense } from "@/lib/actions/recurring-expense";
import type { PaymentMethodType, Frequency } from "@prisma/client";

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
  expense?: {
    id: string;
    name: string;
    description: string | null;
    amount: number;
    frequency: Frequency;
    startDate: string;
    endDate: string | null;
    paymentMethodType: PaymentMethodType;
    paymentMethodId: string;
    category: string | null;
  };
  cards: CardOption[];
  incomeSources: IncomeSourceOption[];
}

export function RecurringExpenseForm({ expense, cards, incomeSources }: Props) {
  const [methodType, setMethodType] = useState<string>(expense?.paymentMethodType ?? "CREDIT_CARD");
  const [methodId, setMethodId] = useState(expense?.paymentMethodId ?? "");

  const action = expense ? updateRecurringExpense.bind(null, expense.id) : createRecurringExpense;

  const creditCards = cards.filter((c) => c.type === "CREDIT");
  const debitCards = cards.filter((c) => c.type === "DEBIT");

  const methodOptions =
    methodType === "CREDIT_CARD" ? creditCards :
    methodType === "DEBIT_CARD" ? debitCards :
    incomeSources;

  const handleMethodTypeChange = (type: string | null) => {
    if (!type) return;
    setMethodType(type);
    setMethodId("");
  };

  return (
    <form action={action} className="space-y-4 max-w-md">
      <input type="hidden" name="paymentMethodType" value={methodType} />
      <input type="hidden" name="paymentMethodId" value={methodId ?? ""} />

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={expense?.name}
          placeholder="Ej: Netflix, Luz CFE, Seguro auto"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={expense?.description ?? ""}
          placeholder="Notas adicionales"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            required
            defaultValue={expense?.amount?.toString()}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frecuencia</Label>
          <Select name="frequency" defaultValue={expense?.frequency ?? "MONTHLY"}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha de inicio</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={expense?.startDate?.slice(0, 10)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de fin (opcional)</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={expense?.endDate?.slice(0, 10) ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethodType">Tipo de método de pago</Label>
        <Select value={methodType} onValueChange={handleMethodTypeChange}>
          <SelectTrigger id="paymentMethodType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PAYMENT_METHOD_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethodId">Método de pago</Label>
        {methodOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tienes {PAYMENT_METHOD_TYPE_LABELS[methodType]?.toLowerCase()}s registradas.
          </p>
        ) : (
          <Select value={methodId} onValueChange={(v) => setMethodId(v ?? "")}>
            <SelectTrigger id="paymentMethodId">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {methodOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {"lastFourDigits" in opt
                    ? `${opt.name} (••••${(opt as CardOption).lastFourDigits})`
                    : opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría (opcional)</Label>
        <Select name="category" defaultValue={expense?.category ?? ""}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Sin categoría" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">
        {expense ? "Guardar cambios" : "Crear gasto"}
      </Button>
    </form>
  );
}
