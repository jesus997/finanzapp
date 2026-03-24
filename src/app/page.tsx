import { auth } from "@/lib/auth";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getOnboardingStatus } from "@/lib/actions/onboarding";
import { OnboardingTour } from "@/components/onboarding-tour";

const EVENT_STYLES: Record<string, string> = {
  income: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  card_payment: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  loan: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  expense: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  income: "Ingreso",
  card_payment: "Pago tarjeta",
  loan: "Préstamo",
  expense: "Gasto",
};

const fmt = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">FinanzApp</h1>
        <p className="text-muted-foreground">Gestión de finanzas personales</p>
        <p className="text-sm text-muted-foreground">Inicia sesión para comenzar</p>
      </div>
    );
  }

  const [stats, onboardingCompleted] = await Promise.all([
    getDashboardStats(),
    getOnboardingStatus(),
  ]);

  return (
    <div className="space-y-6">
      {!onboardingCompleted && <OnboardingTour />}

      <h1 className="text-2xl font-bold">
        Hola, {session.user.name ?? "usuario"}
      </h1>

      {/* Resumen del mes */}
      <div id="tour-summary" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Ingresos del mes</p>
          <p className="text-lg font-semibold text-green-600">{fmt(stats.monthlyIncome)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Gastos del mes</p>
          <p className="text-lg font-semibold text-destructive">{fmt(stats.monthlyExpenses)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Préstamos del mes</p>
          <p className="text-lg font-semibold text-orange-600">{fmt(stats.monthlyLoans)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Balance proyectado</p>
          <p className={`text-lg font-semibold ${stats.projectedBalance >= 0 ? "text-green-600" : "text-destructive"}`}>
            {fmt(stats.projectedBalance)}
          </p>
        </div>
      </div>

      {/* Ahorro y deuda */}
      <div className="grid gap-4 grid-cols-2">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Ahorro acumulado</p>
          <p className="text-lg font-semibold text-green-600">{fmt(stats.totalSavings)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Deuda total</p>
          <p className="text-lg font-semibold text-destructive">{fmt(stats.totalDebt)}</p>
        </div>
      </div>

      {/* Próximos eventos */}
      <div id="tour-upcoming" className="space-y-3">
        <h2 className="text-lg font-semibold">Próximos pagos e ingresos</h2>
        {stats.upcoming.length > 0 ? (
          <div className="space-y-2">
            {stats.upcoming.map((e, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-lg px-3 py-2 ${EVENT_STYLES[e.type] ?? "bg-muted"}`}
              >
                <div>
                  <p className="text-sm font-medium">{e.label}</p>
                  <p className="text-xs opacity-75">Día {e.day} · {EVENT_TYPE_LABELS[e.type] ?? e.type}</p>
                </div>
                {e.amount != null && (
                  <p className="text-sm font-semibold">{fmt(e.amount)}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin eventos próximos. Registra tus ingresos y gastos para verlos aquí.</p>
        )}
      </div>

      {/* Accesos rápidos */}
      <div id="tour-shortcuts" className="space-y-3">
        <h2 className="text-lg font-semibold">Accesos rápidos</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <Link href="/ingresos" className={buttonVariants({ variant: "outline", className: "h-16" })}>
            Ingresos
          </Link>
          <Link href="/tarjetas" className={buttonVariants({ variant: "outline", className: "h-16" })}>
            Tarjetas
          </Link>
          <Link href="/prestamos" className={buttonVariants({ variant: "outline", className: "h-16" })}>
            Préstamos
          </Link>
          <Link href="/gastos" className={buttonVariants({ variant: "outline", className: "h-16" })}>
            Gastos
          </Link>
          <Link href="/gastos-diarios" className={buttonVariants({ variant: "outline", className: "h-16" })}>
            Gastos diarios
          </Link>
          <Link href="/ahorro" className={buttonVariants({ variant: "outline", className: "h-16" })}>
            Ahorro
          </Link>
          <Link href="/calendario" className={buttonVariants({ variant: "outline", className: "h-16" })}>
            Calendario
          </Link>
          <Link href="/dispersiones" className={buttonVariants({ variant: "outline", className: "h-16" })}>
            Dispersiones
          </Link>
          <Link href="/compras" className={buttonVariants({ variant: "outline", className: "h-16" })}>
            Compras
          </Link>
        </div>
      </div>
    </div>
  );
}
