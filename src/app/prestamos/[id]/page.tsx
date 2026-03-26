import { notFound } from "next/navigation";
import Link from "next/link";
import { getLoan } from "@/lib/actions/loan";
import { LOAN_TYPE_LABELS, LOAN_PAYMENT_FREQUENCY_LABELS } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { AmortizationTable } from "@/components/loan/amortization-table";
import { calculateAmortization } from "@/lib/utils/amortization";
import { formatCurrency as fmt } from "@/lib/utils";

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loan = await getLoan(id);

  if (!loan) notFound();

  const totalAmount = Number(loan.totalAmount);
  const paymentAmount = Number(loan.paymentAmount);
  const interestRate = Number(loan.interestRate);
  const remainingBalance = Number(loan.remainingBalance);
  const freqLabel = LOAN_PAYMENT_FREQUENCY_LABELS[loan.paymentFrequency]?.toLowerCase() ?? "";

  const amortization = calculateAmortization(
    totalAmount,
    paymentAmount,
    interestRate,
    loan.paymentFrequency,
    loan.startDate,
    remainingBalance,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{loan.name}</h1>
          <p className="text-sm text-muted-foreground">
            {loan.institution} · <Badge variant="secondary">{LOAN_TYPE_LABELS[loan.type]}</Badge>
          </p>
        </div>
        <Link
          href="/prestamos"
          className={buttonVariants({ variant: "outline" })}
        >
          Volver
        </Link>
      </div>

      {amortization.insufficientPayment && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold">⚠️ El pago {freqLabel} no cubre los intereses</p>
          <p>
            Con una tasa del {interestRate}%, los intereses del periodo son {fmt(amortization.currentPeriodInterest)},
            pero el pago es de {fmt(paymentAmount)}. El saldo crecerá cada periodo.
            Los totales proyectados solo reflejan lo pagado hasta hoy.
          </p>
        </div>
      )}

      {!amortization.insufficientPayment && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Monto total</p>
            <p className="text-lg font-semibold">{fmt(totalAmount)}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Total a pagar (con intereses)</p>
            <p className="text-lg font-semibold">{fmt(amortization.totalPaid)}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Total intereses</p>
            <p className="text-lg font-semibold text-destructive">{fmt(amortization.totalInterest)}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Saldo restante</p>
            <p className="text-lg font-semibold">{fmt(remainingBalance)}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Intereses pagados hasta hoy</p>
          <p className="text-lg font-semibold text-destructive">{fmt(amortization.interestPaidSoFar)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Capital pagado hasta hoy</p>
          <p className="text-lg font-semibold text-green-600">{fmt(amortization.principalPaidSoFar)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Próximo pago — intereses</p>
          <p className="text-lg font-semibold text-destructive">{fmt(amortization.currentPeriodInterest)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Próximo pago — capital</p>
          <p className="text-lg font-semibold text-green-600">{fmt(amortization.currentPeriodPrincipal)}</p>
        </div>
      </div>

      <AmortizationTable schedule={amortization.schedule} paymentAmount={paymentAmount} />
    </div>
  );
}
