"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Event {
  label: string;
  day: number;
  amount: number | null;
  type: string;
  detail: string;
}

const EVENT_STYLES: Record<string, string> = {
  income: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  card_payment: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  loan: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  expense: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  income: "Ingreso",
  card_payment: "Pago tarjeta",
  loan: "Préstamo",
  expense: "Gasto",
};

const fmt = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

export function UpcomingEvents({ events }: { events: Event[] }) {
  const [selected, setSelected] = useState<Event | null>(null);

  return (
    <>
      <div className="space-y-2">
        {events.map((e, i) => (
          <button
            key={i}
            onClick={() => setSelected(e)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-opacity hover:opacity-80 ${EVENT_STYLES[e.type] ?? "bg-muted"}`}
          >
            <div>
              <p className="text-sm font-medium">{e.label}</p>
              <p className="text-xs opacity-75">Día {e.day} · {EVENT_TYPE_LABELS[e.type] ?? e.type}</p>
            </div>
            {e.amount != null && (
              <p className="text-sm font-semibold">{fmt(e.amount)}</p>
            )}
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.label}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${EVENT_STYLES[selected.type] ?? "bg-muted"}`}>
                {EVENT_TYPE_LABELS[selected.type] ?? selected.type}
              </div>
              {selected.amount != null && (
                <p className="text-2xl font-bold">{fmt(selected.amount)}</p>
              )}
              <p className="text-sm text-muted-foreground">Día {selected.day} del mes</p>
              {selected.detail && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selected.detail.split(" · ").join("\n")}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
