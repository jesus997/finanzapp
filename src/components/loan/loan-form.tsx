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
import { BankCombobox } from "@/components/ui/bank-combobox";
import { LOAN_TYPE_LABELS, LOAN_PAYMENT_FREQUENCY_LABELS } from "@/lib/constants";
import { createLoan, updateLoan } from "@/lib/actions/loan";
import type { LoanType, Frequency } from "@prisma/client";

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

interface Props {
  loan?: {
    id: string;
    name: string;
    type: LoanType;
    institution: string;
    totalAmount: number;
    paymentAmount: number;
    paymentFrequency: Frequency;
    interestRate: number;
    startDate: string;
    endDate: string | null;
    cutOffDay: number | null;
    paymentDueDay: number;
    remainingBalance: number;
  };
}

export function LoanForm({ loan }: Props) {
  const router = useRouter();
  const [loanType, setLoanType] = useState<string>(loan?.type ?? "BANK");
  const [institution, setInstitution] = useState(loan?.institution ?? "");

  const handleTypeChange = (type: string | null) => {
    if (!type) return;
    setLoanType(type);
    if (type === "INFONAVIT") setInstitution("Infonavit");
  };

  const action = loan ? updateLoan.bind(null, loan.id) : createLoan;

  return (
    <form action={action} className="space-y-4 max-w-md">
      <input type="hidden" name="type" value={loanType} />

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={loan?.name}
          placeholder="Ej: Crédito automotriz BBVA"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select value={loanType} onValueChange={handleTypeChange}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LOAN_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Institución</Label>
        <BankCombobox
          name="institution"
          value={institution}
          onValueChange={(v) => setInstitution(v ?? "")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Monto total</Label>
          <Input
            id="totalAmount"
            name="totalAmount"
            type="number"
            step="0.01"
            required
            defaultValue={loan?.totalAmount?.toString()}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="remainingBalance">Saldo restante</Label>
          <Input
            id="remainingBalance"
            name="remainingBalance"
            type="number"
            step="0.01"
            required
            defaultValue={loan?.remainingBalance?.toString()}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="paymentAmount">Monto del pago</Label>
          <Input
            id="paymentAmount"
            name="paymentAmount"
            type="number"
            step="0.01"
            required
            defaultValue={loan?.paymentAmount?.toString()}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentFrequency">Frecuencia de pago</Label>
          <Select name="paymentFrequency" defaultValue={loan?.paymentFrequency ?? "MONTHLY"}>
            <SelectTrigger id="paymentFrequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LOAN_PAYMENT_FREQUENCY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interestRate">Tasa de interés anual (%)</Label>
        <Input
          id="interestRate"
          name="interestRate"
          type="number"
          step="0.01"
          defaultValue={loan?.interestRate?.toString() ?? "0"}
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Fecha de inicio</Label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          required
          defaultValue={loan?.startDate?.slice(0, 10)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">Fecha de fin (opcional, se calcula si se omite)</Label>
        <Input
          id="endDate"
          name="endDate"
          type="date"
          defaultValue={loan?.endDate?.slice(0, 10) ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="cutOffDay">Día de corte (opcional)</Label>
          <Select name="cutOffDay" defaultValue={loan?.cutOffDay?.toString() ?? ""}>
            <SelectTrigger id="cutOffDay">
              <SelectValue placeholder="Sin corte" />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_MONTH.map((d) => (
                <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentDueDay">Día límite de pago</Label>
          <Select name="paymentDueDay" defaultValue={loan?.paymentDueDay?.toString() ?? "1"}>
            <SelectTrigger id="paymentDueDay">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_MONTH.map((d) => (
                <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {loan ? "Guardar cambios" : "Crear préstamo"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
