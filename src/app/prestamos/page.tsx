import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { getLoans, deleteLoan } from "@/lib/actions/loan";
import { LOAN_TYPE_LABELS } from "@/lib/constants";

export default async function LoansPage() {
  const loans = await getLoans();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Préstamos</h1>
        <Link href="/prestamos/nuevo" className={buttonVariants()}>
          Agregar
        </Link>
      </div>

      {loans.length === 0 ? (
        <p className="text-muted-foreground">
          No tienes préstamos registrados.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {loans.map((loan) => {
            const total = Number(loan.totalAmount);
            const remaining = Number(loan.remainingBalance);
            const paid = total - remaining;
            const progress = total > 0 ? (paid / total) * 100 : 0;

            return (
              <div key={loan.id} className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{loan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {loan.institution}{loan.cutOffDay ? ` · Corte: ${loan.cutOffDay}` : ""} · Pago: {loan.paymentDueDay}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {LOAN_TYPE_LABELS[loan.type]}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs">Monto total</p>
                    <p className="font-medium text-foreground">
                      ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs">Saldo restante</p>
                    <p className="font-medium text-foreground">
                      ${remaining.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs">Pago mensual</p>
                    <p className="font-medium text-foreground">
                      ${Number(loan.monthlyPayment).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/prestamos/${loan.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Amortización
                  </Link>
                  <Link
                    href={`/prestamos/${loan.id}/editar`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Editar
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteLoan(loan.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-destructive/10 px-2.5 text-[0.8rem] font-medium text-destructive hover:bg-destructive/20"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
