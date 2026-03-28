"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withdrawFromSavingsFund } from "@/lib/actions/savings-fund";
import { formatCurrency as fmt } from "@/lib/utils";

interface Props {
  fundId: string;
  maxAmount: number;
}

export function SavingsWithdrawForm({ fundId, maxAmount }: Props) {
  const action = withdrawFromSavingsFund.bind(null, fundId);

  return (
    <form action={action} className="space-y-2">
      <div className="flex gap-2 items-center">
        <Input name="amount" type="number" step="0.01" min="0.01" max={maxAmount} placeholder="Monto" required className="flex-1" />
        <Input name="note" placeholder="Nota (opcional)" className="flex-1" />
        <Button type="submit" variant="outline" size="sm">
          Retirar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Máximo: {fmt(maxAmount)}</p>
    </form>
  );
}
