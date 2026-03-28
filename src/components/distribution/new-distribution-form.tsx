"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { formatCurrency as fmt } from "@/lib/utils";

interface IncomeSourceOption {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

interface Props {
  incomeSources: IncomeSourceOption[];
}

export function NewDistributionForm({ incomeSources }: Props) {
  const [sourceId, setSourceId] = useState("");
  const [preview, setPreview] = useState<DistributionPreview | null>(null);
  const [loading, setLoading] = useState(false);
  // Savings overrides: fundId -> amount (null = skipped)
  const [savingsOverrides, setSavingsOverrides] = useState<Record<string, number | null>>({});

  const handleCalculate = async () => {
    if (!sourceId) return;
    setLoading(true);
    const result = await calculateDistribution(sourceId);
    setPreview(result);
    setSavingsOverrides({});
    setLoading(false);
  };

  // Effective savings with overrides applied
  const effectiveSavings = useMemo(() => {
    if (!preview) return [];
    return preview.savings.map((fund) => {
      const override = savingsOverrides[fund.id];
      if (override === null) return { ...fund, amount: 0, skipped: true };
      if (override !== undefined) return { ...fund, amount: override, skipped: false };
      return { ...fund, skipped: false };
    });
  }, [preview, savingsOverrides]);

  // Recalculate totals with overrides
  const totals = useMemo(() => {
    if (!preview) return { totalAllocated: 0, remaining: 0 };
    const totalCards = preview.cardGroups.reduce((s, g) => s + g.totalPerPaycheck, 0);
    const totalLoans = preview.loans.reduce((s, l) => s + l.perPaycheck, 0);
    const totalSavings = effectiveSavings.reduce((s, f) => s + f.amount, 0);
    const totalAllocated = Math.round((totalCards + totalLoans + totalSavings) * 100) / 100;
    const remaining = Math.round((preview.totalAmount - totalAllocated) * 100) / 100;
    return { totalAllocated, remaining };
  }, [preview, effectiveSavings]);

  const handleConfirm = async () => {
    if (!preview) return;
    setLoading(true);

    const items: { destinationType: string; destinationId: string; amount: number; groupId?: string }[] = [];

    for (const group of preview.cardGroups) {
      for (const exp of group.expenses) {
        items.push({ destinationType: "expense", destinationId: exp.id, amount: exp.perPaycheck, groupId: group.cardId });
      }
    }
    for (const loan of preview.loans) {
      items.push({ destinationType: "loan", destinationId: loan.id, amount: loan.perPaycheck });
    }
    for (const fund of effectiveSavings) {
      if (!fund.skipped && fund.amount > 0) {
        items.push({ destinationType: "savings", destinationId: fund.id, amount: fund.amount });
      }
    }

    await createDistribution(preview.incomeSourceId, items);
  };

  const hasItems = preview && (preview.cardGroups.length > 0 || preview.loans.length > 0 || effectiveSavings.some((f) => !f.skipped && f.amount > 0));

  const toggleSkip = (fundId: string) => {
    setSavingsOverrides((prev) => {
      if (prev[fundId] === null) {
        const { [fundId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [fundId]: null };
    });
  };

  const updateAmount = (fundId: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    setSavingsOverrides((prev) => ({ ...prev, [fundId]: Math.round(num * 100) / 100 }));
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label>Fuente de ingreso recibida</Label>
        <div className="flex gap-2">
          <Select value={sourceId} onValueChange={(v) => setSourceId(v ?? "")}>
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

          {/* Savings — editable */}
          {preview.savings.length > 0 && (
            <div className="space-y-2">
              {preview.savings.map((fund) => {
                const effective = effectiveSavings.find((f) => f.id === fund.id)!;
                const isSkipped = effective.skipped;
                const isEdited = savingsOverrides[fund.id] !== undefined && savingsOverrides[fund.id] !== null;

                return (
                  <div key={fund.id} className={`rounded-lg border p-3 space-y-2 ${isSkipped ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[0.65rem]">Ahorro</Badge>
                        <span className="text-sm">{fund.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSkip(fund.id)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {isSkipped ? "Incluir" : "Omitir"}
                      </button>
                    </div>
                    {!isSkipped && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={isEdited ? savingsOverrides[fund.id]! : fund.amount}
                          onChange={(e) => updateAmount(fund.id, e.target.value)}
                          className="h-8 w-28 text-sm"
                        />
                        {isEdited && (
                          <span className="text-xs text-muted-foreground">
                            (original: {fmt(fund.amount)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total a apartar</span>
              <span className="font-medium">{fmt(totals.totalAllocated)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Disponible</span>
              <span className={`font-bold ${totals.remaining < 0 ? "text-destructive" : "text-green-600"}`}>
                {fmt(totals.remaining)}
              </span>
            </div>
          </div>

          {totals.remaining < 0 && (
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
