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
import { BankCombobox } from "@/components/ui/bank-combobox";
import { LOAN_TYPE_LABELS } from "@/lib/constants";
import { createLoan, updateLoan } from "@/lib/actions/loan";
import type { LoanType } from "@prisma/client";

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

interface Props {
  loan?: {
    id: string;
    name: string;
    type: LoanType;
    institution: string;
    totalAmount: number;
    monthlyPayment: number;
    interestRate: number;
    startDate: string;
    endDate: string;
    paymentDay: number;
    remainingBalance: number;
  };
}

export function LoanForm({ loan }: Props) {
  const [loanType, setLoanType] = useState<string>(loan?.type ?? "BANK");
  const [institution, setInstitution] = useState(loan?.institution ?? "");

  const handleTypeChange = (type: string) => {
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
          onValueChange={setInstitution}
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
          <Label htmlFor="monthlyPayment">Pago mensual</Label>
          <Input
            id="monthlyPayment"
            name="monthlyPayment"
            type="number"
            step="0.01"
            required
            defaultValue={loan?.monthlyPayment?.toString()}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interestRate">Tasa de interés (%)</Label>
          <Input
            id="interestRate"
            name="interestRate"
            type="number"
            step="0.01"
            defaultValue={loan?.interestRate?.toString() ?? "0"}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
          <Label htmlFor="endDate">Fecha de fin</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            required
            defaultValue={loan?.endDate?.slice(0, 10)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentDay">Día de pago</Label>
        <Select name="paymentDay" defaultValue={loan?.paymentDay?.toString() ?? "1"}>
          <SelectTrigger id="paymentDay">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS_OF_MONTH.map((d) => (
              <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">
        {loan ? "Guardar cambios" : "Crear préstamo"}
      </Button>
    </form>
  );
}
