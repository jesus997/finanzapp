import { notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { getSavingsFund, getSavingsFundMovements, withdrawFromSavingsFund } from "@/lib/actions/savings-fund";
import { SAVINGS_TYPE_LABELS, FREQUENCY_LABELS } from "@/lib/constants";
import { formatCurrency as fmt } from "@/lib/utils";
import { SavingsWithdrawForm } from "@/components/savings-fund/savings-withdraw-form";

export default async function SavingsFundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [fund, movements] = await Promise.all([
    getSavingsFund(id),
    getSavingsFundMovements(id),
  ]);

  if (!fund) notFound();

  const accumulated = Number(fund.accumulatedBalance);
  const target = fund.targetAmount ? Number(fund.targetAmount) : null;
  const isCompleted = !!fund.completedAt;
  const progress = target ? Math.min((accumulated / target) * 100, 100) : null;

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{fund.name}</h1>
        {isCompleted ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            ✓ Completado
          </Badge>
        ) : (
          <Badge variant="secondary">{SAVINGS_TYPE_LABELS[fund.type]}</Badge>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Saldo acumulado</p>
          <p className="text-xl font-bold">{fmt(accumulated)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">
            {fund.type === "PERCENTAGE" ? "Porcentaje" : `Monto ${FREQUENCY_LABELS[fund.frequency]?.toLowerCase() ?? ""}`}
          </p>
          <p className="text-xl font-bold">
            {fund.type === "PERCENTAGE" ? `${Number(fund.value)}%` : fmt(Number(fund.value))}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {target !== null && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Meta: {fmt(target)}</span>
            <span>{progress!.toFixed(0)}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {fund.targetDate && (
            <p className="text-xs text-muted-foreground">
              Fecha límite: {new Date(fund.targetDate).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      )}

      {/* Withdraw */}
      {accumulated > 0 && !isCompleted && (
        <div className="rounded-xl border p-4 space-y-3">
          <p className="text-sm font-medium">Retirar del fondo</p>
          <SavingsWithdrawForm fundId={id} maxAmount={accumulated} />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link href={`/ahorro/${id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          Editar
        </Link>
        <Link href="/ahorro" className={buttonVariants({ variant: "outline", size: "sm" })}>
          ← Volver
        </Link>
      </div>

      {/* Movement history */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Historial de movimientos</h2>
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin movimientos aún. Los aportes se registran al hacer dispersiones.</p>
        ) : (
          <div className="space-y-2">
            {movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">
                    {m.type === "DEPOSIT" ? "Aporte" : "Retiro"}
                    {m.sourceName && <span className="text-muted-foreground"> · {m.sourceName}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.createdAt.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    {m.note && ` · ${m.note}`}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${m.type === "DEPOSIT" ? "text-green-600" : "text-destructive"}`}>
                  {m.type === "DEPOSIT" ? "+" : "−"}{fmt(m.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
