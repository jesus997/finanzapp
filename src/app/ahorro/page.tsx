import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { getSavingsFunds, deleteSavingsFund } from "@/lib/actions/savings-fund";
import { SAVINGS_TYPE_LABELS, FREQUENCY_LABELS } from "@/lib/constants";
import { formatCurrency as fmt } from "@/lib/utils";

export default async function SavingsFundsPage() {
  const funds = await getSavingsFunds();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Apartados de ahorro</h1>
        <Link href="/ahorro/nuevo" className={buttonVariants()}>
          Agregar
        </Link>
      </div>

      {funds.length === 0 ? (
        <p className="text-muted-foreground">
          No tienes apartados de ahorro registrados.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {funds.map((fund) => {
            const value = Number(fund.value);
            const accumulated = Number(fund.accumulatedBalance);
            const target = fund.targetAmount ? Number(fund.targetAmount) : null;
            const isCompleted = !!fund.completedAt;
            const progress = target ? Math.min((accumulated / target) * 100, 100) : null;

            return (
              <div key={fund.id} className={`rounded-xl border p-4 space-y-3 ${isCompleted ? "opacity-75" : ""}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/ahorro/${fund.id}`} className="font-semibold hover:underline">
                      {fund.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {fund.incomeSource?.name ?? "Sin fuente vinculada"}
                    </p>
                  </div>
                  {isCompleted ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      ✓ Completado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      {SAVINGS_TYPE_LABELS[fund.type]}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs">
                      {fund.type === "PERCENTAGE" ? "Porcentaje" : `Monto ${FREQUENCY_LABELS[fund.frequency]?.toLowerCase() ?? ""}`}
                    </p>
                    <p className="font-medium text-foreground">
                      {fund.type === "PERCENTAGE"
                        ? `${value}%`
                        : fmt(value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs">Saldo acumulado</p>
                    <p className="font-medium text-foreground">
                      {fmt(accumulated)}
                    </p>
                  </div>
                </div>

                {/* Progress bar when there's a target */}
                {target !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Meta: {fmt(target)}</span>
                      <span>{progress!.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
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

                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/ahorro/${fund.id}/editar`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Editar
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteSavingsFund(fund.id);
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
