"use client";

import { useState } from "react";
import { FREQUENCY_LABELS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency as fmt } from "@/lib/utils";

interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

interface DailyExpense {
  id: string;
  name: string;
  amount: number;
  date: string;
}

interface Props {
  cardName: string;
  expenses: RecurringExpense[];
  dailyExpenses: DailyExpense[];
}

export function CardExpensesList({ cardName, expenses, dailyExpenses }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"recurring" | "daily">("recurring");

  const total = expenses.length + dailyExpenses.length;
  if (total === 0) return null;

  const recurringTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const dailyTotal = dailyExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-primary hover:underline"
      >
        Ver gastos ({total})
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gastos — {cardName}</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setTab("recurring")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === "recurring" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              Periódicos ({expenses.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("daily")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === "daily" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              Diarios ({dailyExpenses.length})
            </button>
          </div>

          {/* Recurring */}
          {tab === "recurring" && (
            <div className="space-y-1 text-sm">
              {expenses.length === 0 ? (
                <p className="text-muted-foreground">Sin gastos periódicos.</p>
              ) : (
                <>
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex justify-between py-1">
                      <span className="text-muted-foreground">
                        {exp.name} <span className="text-xs">({FREQUENCY_LABELS[exp.frequency]?.toLowerCase()})</span>
                      </span>
                      <span className="font-medium">{fmt(exp.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total</span>
                    <span>{fmt(recurringTotal)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Daily */}
          {tab === "daily" && (
            <div className="space-y-1 text-sm">
              {dailyExpenses.length === 0 ? (
                <p className="text-muted-foreground">Sin gastos diarios.</p>
              ) : (
                <>
                  {dailyExpenses.map((exp) => (
                    <div key={exp.id} className="flex justify-between py-1">
                      <span className="text-muted-foreground">
                        {exp.name} <span className="text-xs">{new Date(exp.date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}</span>
                      </span>
                      <span className="font-medium">{fmt(exp.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total</span>
                    <span>{fmt(dailyTotal)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
