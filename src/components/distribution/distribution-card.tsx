"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

interface Detail {
  id: string;
  destinationType: string;
  destinationId: string;
  groupId: string | null;
  name: string;
  groupName: string | null;
  amount: number;
}

interface Distribution {
  id: string;
  date: Date;
  totalAmount: number;
  incomeSourceName: string;
  details: Detail[];
}

interface Props {
  distribution: Distribution;
}

const TYPE_LABELS: Record<string, string> = {
  expense: "Gasto",
  loan: "Préstamo",
  savings: "Ahorro",
};

export function DistributionCard({ distribution: dist }: Props) {
  const [view, setView] = useState<"bolsas" | "detalle">("bolsas");

  const allocated = dist.details.reduce((s, d) => s + d.amount, 0);
  const remaining = dist.totalAmount - allocated;

  // Build card groups from groupId
  const cardGroupsMap = new Map<string, { name: string; items: Detail[]; total: number }>();
  const ungrouped: Detail[] = [];

  for (const d of dist.details) {
    if (d.groupId) {
      let group = cardGroupsMap.get(d.groupId);
      if (!group) {
        group = { name: d.groupName ?? "Tarjeta", items: [], total: 0 };
        cardGroupsMap.set(d.groupId, group);
      }
      group.items.push(d);
      group.total += d.amount;
    } else {
      ungrouped.push(d);
    }
  }

  const cardGroups = [...cardGroupsMap.entries()];

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{dist.incomeSourceName}</p>
          <p className="text-sm text-muted-foreground">
            {dist.date.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span className="text-lg font-bold">{fmt(dist.totalAmount)}</span>
      </div>

      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setView("bolsas")}
          className={`rounded px-2 py-1 ${view === "bolsas" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          Por bolsas
        </button>
        <button
          onClick={() => setView("detalle")}
          className={`rounded px-2 py-1 ${view === "detalle" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          Detalle
        </button>
      </div>

      {view === "bolsas" ? (
        <div className="space-y-3">
          {cardGroups.map(([cardId, group]) => (
            <div key={cardId} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge>Tarjeta</Badge>
                  <span className="font-semibold">{group.name}</span>
                </div>
                <span className="text-lg font-bold">{fmt(group.total)}</span>
              </div>
              <div className="space-y-1 pl-3 border-l-2 border-muted">
                {group.items.map((d) => (
                  <div key={d.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>{d.name}</span>
                    <span>{fmt(d.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {ungrouped.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {TYPE_LABELS[d.destinationType] ?? d.destinationType}
                </Badge>
                <span>{d.name}</span>
              </div>
              <span className="font-medium">{fmt(d.amount)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {dist.details.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {TYPE_LABELS[d.destinationType] ?? d.destinationType}
                </Badge>
                <span>{d.name}</span>
                {d.groupName && (
                  <span className="text-xs text-muted-foreground">({d.groupName})</span>
                )}
              </div>
              <span className="font-medium">{fmt(d.amount)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-2 text-sm">
        <span className="text-muted-foreground">Disponible</span>
        <span className={`font-bold ${remaining < 0 ? "text-destructive" : "text-green-600"}`}>
          {fmt(remaining)}
        </span>
      </div>
    </div>
  );
}
