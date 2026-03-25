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
import type { SavingsType, Frequency } from "@prisma/client";

const SAVINGS_FREQUENCIES: Frequency[] = [
  "WEEKLY", "BIWEEKLY", "MONTHLY", "BIMONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL",
];

interface IncomeSourceOption {
  id: string;
  name: string;
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
  };
  incomeSources: IncomeSourceOption[];
}

export function SavingsFundForm({ fund, incomeSources }: Props) {
  const router = useRouter();
  const [savingsType, setSavingsType] = useState<string>(fund?.type ?? "FIXED_AMOUNT");
  const [frequency, setFrequency] = useState<string>(fund?.frequency ?? "MONTHLY");

  const action = fund ? updateSavingsFund.bind(null, fund.id) : createSavingsFund;

  return (
    <form action={action} className="space-y-4 max-w-md">
      <input type="hidden" name="type" value={savingsType} />
      <input type="hidden" name="frequency" value={frequency} />

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
        />
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
          <Select name="incomeSourceId" defaultValue={fund?.incomeSourceId}>
            <SelectTrigger id="incomeSourceId">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {incomeSources.map((src) => (
                <SelectItem key={src.id} value={src.id}>{src.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            El ahorro se descuenta de este ingreso al hacer la dispersión.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accumulatedBalance">Saldo acumulado</Label>
        <Input
          id="accumulatedBalance"
          name="accumulatedBalance"
          type="number"
          step="0.01"
          defaultValue={fund?.accumulatedBalance?.toString() ?? "0"}
          placeholder="0.00"
        />
      </div>

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
