"use client";

import { useState } from "react";
import { FREQUENCY_LABELS } from "@/lib/constants";

interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

export function CardExpensesList({ expenses }: { expenses: Expense[] }) {
  const [open, setOpen] = useState(false);

  if (expenses.length === 0) return null;

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm text-primary hover:underline"
      >
        {open ? "Ocultar" : "Ver"} gastos ({expenses.length})
      </button>
      {open && (
        <div className="mt-2 space-y-1 text-sm">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex justify-between">
              <span className="text-muted-foreground">
                {exp.name} <span className="text-xs">({FREQUENCY_LABELS[exp.frequency]?.toLowerCase()})</span>
              </span>
              <span className="font-medium">{fmt(exp.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-1 font-medium">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
