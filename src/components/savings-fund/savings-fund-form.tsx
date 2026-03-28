"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SAVINGS_TYPE_LABELS, FREQUENCY_LABELS } from "@/lib/constants";
import { createSavingsFund, updateSavingsFund } from "@/lib/actions/savings-fund";
import { formatCurrency as fmt } from "@/lib/utils";
import type { SavingsType, Frequency } from "@prisma/client";

const SAVINGS_FREQUENCIES: Frequency[] = [
  "WEEKLY", "BIWEEKLY", "MONTHLY", "BIMONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL",
];

interface IncomeSourceOption {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

interface Props {
  fund?: {
    id: string;
    name: string;
    type: SavingsType;
    value: number;
    frequency: Frequency;
    incomeSourceId: string;
    accumulatedBalance: number;
    targetAmount: number | null;
    targetDate: string | null;
    completedAt: string | null;
  };
  incomeSources: IncomeSourceOption[];
}

export function SavingsFundForm({ fund, incomeSources }: Props) {
  const router = useRouter();
  const [savingsType, setSavingsType] = useState<string>(fund?.type ?? "FIXED_AMOUNT");
  const [frequency, setFrequency] = useState<string>(fund?.frequency ?? "MONTHLY");
  const [incomeSourceId, setIncomeSourceId] = useState<string>(fund?.incomeSourceId ?? "");
  const [percentValue, setPercentValue] = useState<string>(fund?.type === "PERCENTAGE" ? fund.value.toString() : "");

  const action = fund ? updateSavingsFund.bind(null, fund.id) : createSavingsFund;

  // Estimate for percentage preview
  const selectedSource = incomeSources.find((s) => s.id === incomeSourceId);
  const percentPreview = savingsType === "PERCENTAGE" && selectedSource && percentValue
    ? selectedSource.amount * parseFloat(percentValue || "0") / 100
    : null;

  return (
    <form action={action} className="space-y-4 max-w-md">
      <input type="hidden" name="type" value={savingsType} />
      <input type="hidden" name="frequency" value={frequency} />
      <input type="hidden" name="incomeSourceId" value={incomeSourceId} />

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={fund?.name}
          placeholder="Ej: Fondo de emergencia, Vacaciones"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo de ahorro</Label>
        <Select value={savingsType} onValueChange={(v) => setSavingsType(v ?? "FIXED_AMOUNT")}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SAVINGS_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {savingsType === "PERCENTAGE"
            ? "Se calcula como porcentaje del ingreso cada vez que dispersas."
            : "Monto fijo que se prorratea según la frecuencia al dispersar."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">
          {savingsType === "PERCENTAGE" ? "Porcentaje (%)" : "Monto ($)"}
        </Label>
        <Input
          id="value"
          name="value"
          type="number"
          step={savingsType === "PERCENTAGE" ? "0.1" : "0.01"}
          max={savingsType === "PERCENTAGE" ? "100" : undefined}
          required
          defaultValue={fund?.value?.toString()}
          placeholder={savingsType === "PERCENTAGE" ? "10" : "0.00"}
          onChange={savingsType === "PERCENTAGE" ? (e) => setPercentValue(e.target.value) : undefined}
        />
        {percentPreview !== null && percentPreview > 0 && (
          <p className="text-xs text-muted-foreground">
            ≈ {fmt(percentPreview)} por dispersión de {selectedSource!.name}
          </p>
        )}
      </div>

      {savingsType === "FIXED_AMOUNT" && (
        <div className="space-y-2">
          <Label htmlFor="frequency">Frecuencia del ahorro</Label>
          <Select value={frequency} onValueChange={(v) => setFrequency(v ?? "MONTHLY")}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SAVINGS_FREQUENCIES.map((f) => (
                <SelectItem key={f} value={f}>{FREQUENCY_LABELS[f]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Al dispersar, el monto se prorratea según la frecuencia de tu ingreso.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="incomeSourceId">Fuente de ingreso vinculada</Label>
        {incomeSources.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tienes fuentes de ingreso activas.
          </p>
        ) : (
          <>
            <Select value={incomeSourceId} onValueChange={(v) => setIncomeSourceId(v ?? "")}>
              <SelectTrigger id="incomeSourceId">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {incomeSources.map((src) => (
                  <SelectItem key={src.id} value={src.id}>
                    {src.name} — {fmt(src.amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              El ahorro se descuenta de este ingreso al hacer la dispersión.
            </p>
          </>
        )}
      </div>

      {/* Target fields */}
      <div className="space-y-2">
        <Label htmlFor="targetAmount">Meta de ahorro (opcional)</Label>
        <Input
          id="targetAmount"
          name="targetAmount"
          type="number"
          step="0.01"
          defaultValue={fund?.targetAmount?.toString() ?? ""}
          placeholder="Ej: 4400"
        />
        <p className="text-xs text-muted-foreground">
          Al alcanzar esta cantidad, el fondo se marca como completado y deja de participar en dispersiones.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetDate">Fecha límite (opcional)</Label>
        <Input
          id="targetDate"
          name="targetDate"
          type="date"
          defaultValue={fund?.targetDate?.split("T")[0] ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Referencia visual de cuándo quieres alcanzar la meta.
        </p>
      </div>

      {/* Read-only accumulated balance in edit mode */}
      {fund && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Saldo acumulado</p>
          <p className="text-lg font-semibold">{fmt(fund.accumulatedBalance)}</p>
          <p className="text-xs text-muted-foreground">
            Se actualiza automáticamente con cada dispersión.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {fund ? "Guardar cambios" : "Crear apartado"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
