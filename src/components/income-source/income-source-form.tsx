"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INCOME_TYPE_LABELS,
  FREQUENCY_LABELS,
  WEEKDAY_LABELS,
  MONTH_LABELS,
  FREQUENCIES_REQUIRING_MONTH,
} from "@/lib/constants";
import { createIncomeSource, updateIncomeSource } from "@/lib/actions/income-source";
import type { IncomeType, Frequency, PayDayType } from "@prisma/client";

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

const PAY_DAY_COUNT: Record<string, number> = {
  WEEKLY: 1,
  BIWEEKLY: 2,
  MONTHLY: 1,
  BIMONTHLY: 6,
  QUARTERLY: 4,
  SEMIANNUAL: 2,
  ANNUAL: 1,
};

const PAY_DAY_LABELS: Record<string, string[]> = {
  BIWEEKLY: ["Primer día de pago", "Segundo día de pago"],
  SEMIANNUAL: ["Primer pago", "Segundo pago"],
  QUARTERLY: ["Pago 1", "Pago 2", "Pago 3", "Pago 4"],
  BIMONTHLY: ["Pago 1", "Pago 2", "Pago 3", "Pago 4", "Pago 5", "Pago 6"],
};

interface DebitCardOption {
  id: string;
  name: string;
  lastFourDigits: string;
}

interface Props {
  incomeSource?: {
    id: string;
    name: string;
    type: IncomeType;
    amount: number;
    frequency: Frequency;
    payDayType: PayDayType;
    payDay: number[];
    payMonth: number[];
    isVariable: boolean;
    oneTimeDate: string | null;
    depositCardId: string | null;
    active: boolean;
  };
  debitCards: DebitCardOption[];
}

export function IncomeSourceForm({ incomeSource, debitCards }: Props) {
  const router = useRouter();
  const [frequency, setFrequency] = useState<Frequency>(
    incomeSource?.frequency ?? "MONTHLY"
  );
  const [payDayType, setPayDayType] = useState<PayDayType>(
    incomeSource?.payDayType ?? "DAY_OF_MONTH"
  );

  const action = incomeSource
    ? updateIncomeSource.bind(null, incomeSource.id)
    : createIncomeSource;

  const isOneTime = frequency === "ONE_TIME";
  const payDayCount = PAY_DAY_COUNT[frequency] ?? 1;
  const existingPayDays = incomeSource?.payDay ?? [];
  const existingPayMonths = incomeSource?.payMonth ?? [];
  const isWeekday = payDayType === "DAY_OF_WEEK";
  const needsMonth = FREQUENCIES_REQUIRING_MONTH.has(frequency);

  return (
    <form action={action} className="space-y-4 max-w-md">
      <input type="hidden" name="frequency" value={frequency} />
      <input type="hidden" name="payDayType" value={payDayType} />
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={incomeSource?.name}
          placeholder="Ej: Nómina empresa"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select name="type" defaultValue={incomeSource?.type ?? "SALARY"}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          required
          defaultValue={incomeSource?.amount?.toString()}
          placeholder="0.00"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isVariable"
          name="isVariable"
          value="true"
          defaultChecked={incomeSource?.isVariable}
          className="size-4 rounded border-input"
        />
        <Label htmlFor="isVariable">El monto es estimado (variable)</Label>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Marca esta opción si el monto cambia cada periodo (ej: comisiones, propinas).
      </p>

      <div className="space-y-2">
        <Label htmlFor="frequency">Frecuencia</Label>
        <Select
          value={frequency}
          onValueChange={(v) => v && setFrequency(v as Frequency)}
        >
          <SelectTrigger id="frequency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isOneTime && (
        <div className="space-y-2">
          <Label>Fecha</Label>
          <DatePicker
            name="oneTimeDate"
            defaultValue={incomeSource?.oneTimeDate}
            required
          />
        </div>
      )}

      {!isOneTime && (
        <>
          <div className="space-y-2">
            <Label htmlFor="payDayType">Tipo de día de pago</Label>
            <Select
              value={payDayType}
              onValueChange={(v) => v && setPayDayType(v as PayDayType)}
            >
              <SelectTrigger id="payDayType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAY_OF_MONTH">Día del mes</SelectItem>
                <SelectItem value="DAY_OF_WEEK">Día de la semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {needsMonth &&
            Array.from({ length: payDayCount }).map((_, i) => {
              const label = PAY_DAY_LABELS[frequency]?.[i] ?? `Pago ${i + 1}`;
              return (
                <fieldset key={`date-${frequency}-${i}`} className="space-y-2 rounded-lg border p-3">
                  <legend className="text-sm font-medium px-1">{label}</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`payMonth-${i}`}>Mes</Label>
                      <Select name="payMonth" defaultValue={existingPayMonths[i]?.toString()}>
                        <SelectTrigger id={`payMonth-${i}`}>
                          <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(MONTH_LABELS).map(([value, mLabel]) => (
                            <SelectItem key={value} value={value}>{mLabel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`payDay-${i}`}>Día</Label>
                      <Select name="payDay" defaultValue={existingPayDays[i]?.toString()}>
                        <SelectTrigger id={`payDay-${i}`}>
                          <SelectValue placeholder="Día" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_MONTH.map((d) => (
                            <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </fieldset>
              );
            })}

          {!needsMonth &&
            Array.from({ length: payDayCount }).map((_, i) => {
              const label = PAY_DAY_LABELS[frequency]?.[i] ?? "Día de pago";
              return isWeekday ? (
                <div key={`day-${frequency}-${payDayType}-${i}`} className="space-y-2">
                  <Label htmlFor={`payDay-${i}`}>{label}</Label>
                  <Select name="payDay" defaultValue={existingPayDays[i]?.toString()}>
                    <SelectTrigger id={`payDay-${i}`}>
                      <SelectValue placeholder="Selecciona un día" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(WEEKDAY_LABELS).map(([value, dayLabel]) => (
                        <SelectItem key={value} value={value}>{dayLabel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div key={`day-${frequency}-${payDayType}-${i}`} className="space-y-2">
                  <Label htmlFor={`payDay-${i}`}>{label}</Label>
                  <Select name="payDay" defaultValue={existingPayDays[i]?.toString()}>
                    <SelectTrigger id={`payDay-${i}`}>
                      <SelectValue placeholder="Día" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_MONTH.map((d) => (
                        <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
        </>
      )}

      {debitCards.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="depositCardId">Tarjeta donde se deposita (opcional)</Label>
          <Select name="depositCardId" defaultValue={incomeSource?.depositCardId ?? ""}>
            <SelectTrigger id="depositCardId">
              <SelectValue placeholder="Sin tarjeta asociada" />
            </SelectTrigger>
            <SelectContent>
              {debitCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name} (••••{card.lastFourDigits})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Vincula la tarjeta de débito donde recibes este ingreso.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {incomeSource ? "Guardar cambios" : "Crear fuente de ingreso"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
