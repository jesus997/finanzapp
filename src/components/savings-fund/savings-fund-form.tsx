"use client";

import { useState } from "react";
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
import { SAVINGS_TYPE_LABELS } from "@/lib/constants";
import { createSavingsFund, updateSavingsFund } from "@/lib/actions/savings-fund";
import type { SavingsType } from "@prisma/client";

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
    incomeSourceId: string;
    accumulatedBalance: number;
  };
  incomeSources: IncomeSourceOption[];
}

export function SavingsFundForm({ fund, incomeSources }: Props) {
  const [savingsType, setSavingsType] = useState<string>(fund?.type ?? "FIXED_AMOUNT");

  const action = fund ? updateSavingsFund.bind(null, fund.id) : createSavingsFund;

  return (
    <form action={action} className="space-y-4 max-w-md">
      <input type="hidden" name="type" value={savingsType} />

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
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">
          {savingsType === "PERCENTAGE" ? "Porcentaje (%)" : "Monto por periodo ($)"}
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

      <Button type="submit">
        {fund ? "Guardar cambios" : "Crear apartado"}
      </Button>
    </form>
  );
}
