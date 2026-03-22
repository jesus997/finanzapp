"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  calculateDistribution,
  createDistribution,
  type DistributionPreview,
} from "@/lib/actions/distribution";

interface IncomeSourceOption {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

interface Props {
  incomeSources: IncomeSourceOption[];
}

const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

export function NewDistributionForm({ incomeSources }: Props) {
  const [sourceId, setSourceId] = useState("");
  const [preview, setPreview] = useState<DistributionPreview | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!sourceId) return;
    setLoading(true);
    const result = await calculateDistribution(sourceId);
    setPreview(result);
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setLoading(true);

    const items: { destinationType: string; destinationId: string; amount: number; groupId?: string }[] = [];

    // Each expense individually, grouped by card
    for (const group of preview.cardGroups) {
      for (const exp of group.expenses) {
        items.push({ destinationType: "expense", destinationId: exp.id, amount: exp.perPaycheck, groupId: group.cardId });
      }
    }
    // Loans
    for (const loan of preview.loans) {
      items.push({ destinationType: "loan", destinationId: loan.id, amount: loan.perPaycheck });
    }
    // Savings
    for (const fund of preview.savings) {
      items.push({ destinationType: "savings", destinationId: fund.id, amount: fund.amount });
    }

    await createDistribution(preview.incomeSourceId, items);
  };

  const hasItems = preview && (preview.cardGroups.length > 0 || preview.loans.length > 0 || preview.savings.length > 0);

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label>Fuente de ingreso recibida</Label>
        <div className="flex gap-2">
          <Select value={sourceId} onValueChange={setSourceId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un ingreso" />
            </SelectTrigger>
            <SelectContent>
              {incomeSources.map((src) => (
                <SelectItem key={src.id} value={src.id}>
                  {src.name} — {fmt(src.amount)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCalculate} disabled={!sourceId || loading} variant="outline">
            Calcular
          </Button>
        </div>
      </div>

      {preview && (
        <div className="space-y-4 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{preview.incomeSourceName}</h3>
              <p className="text-xs text-muted-foreground">
                Prorrateo por cobro ({preview.timesPerMonth}x al mes)
              </p>
            </div>
            <span className="text-lg font-bold">{fmt(preview.totalAmount)}</span>
          </div>

          {!hasItems && (
            <p className="text-sm text-muted-foreground">
              No hay gastos, préstamos ni ahorros vinculados.
            </p>
          )}

          {/* Card groups */}
          {preview.cardGroups.map((group) => (
            <div key={group.cardId} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[0.65rem]">Tarjeta</Badge>
                  <span className="font-medium">{group.cardName}</span>
                  <span className="text-xs text-muted-foreground">
                    {group.cardBank} ••••{group.lastFourDigits}
                  </span>
                </div>
                <span className="font-bold">{fmt(group.totalPerPaycheck)}</span>
              </div>
              {group.paymentDay && (
                <p className="text-xs text-muted-foreground">Fecha de pago: día {group.paymentDay}</p>
              )}
              <div className="space-y-1 pl-2 border-l-2 border-muted">
                {group.expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>{exp.name} <span className="text-xs">({fmt(exp.totalMonthly)}/mes)</span></span>
                    <span>{fmt(exp.perPaycheck)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Loans */}
          {preview.loans.length > 0 && (
            <div className="space-y-2">
              {preview.loans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[0.65rem]">Préstamo</Badge>
                    <span>{loan.name}</span>
                    <span className="text-xs text-muted-foreground">{loan.institution}</span>
                  </div>
                  <span className="font-medium">{fmt(loan.perPaycheck)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Savings */}
          {preview.savings.length > 0 && (
            <div className="space-y-2">
              {preview.savings.map((fund) => (
                <div key={fund.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[0.65rem]">Ahorro</Badge>
                    <span>{fund.name}</span>
                  </div>
                  <span className="font-medium">{fmt(fund.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total a apartar</span>
              <span className="font-medium">{fmt(preview.totalAllocated)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Disponible</span>
              <span className={`font-bold ${preview.remaining < 0 ? "text-destructive" : "text-green-600"}`}>
                {fmt(preview.remaining)}
              </span>
            </div>
          </div>

          {preview.remaining < 0 && (
            <p className="text-xs text-destructive">
              ⚠️ Los compromisos superan el monto del ingreso.
            </p>
          )}

          <Button onClick={handleConfirm} disabled={loading || !hasItems} className="w-full">
            Confirmar dispersión
          </Button>
        </div>
      )}
    </div>
  );
}
