import { auth } from "@/lib/auth";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getOnboardingStatus } from "@/lib/actions/onboarding";
import { OnboardingTour } from "@/components/onboarding-tour";
import { UpcomingEvents } from "@/components/upcoming-events";
import { formatCurrency as fmt } from "@/lib/utils";
import {
  Banknote, CreditCard, Landmark, FileText,
  Receipt, PiggyBank, Calendar, ArrowLeftRight, ShoppingCart,
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <img src="/logo-icon.svg" alt="" className="size-16" />
        <h1 className="text-3xl font-bold">FinanzApp</h1>
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

      {/* Compra en progreso */}
      {stats.activeShopping.length > 0 && (() => {
        const latest = stats.activeShopping[0];
        const moreCount = stats.activeShopping.length - 1;
        return (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">🛒 Compra en progreso</p>
                <p className="mt-1 text-sm font-semibold truncate">{latest.name}</p>
                <p className="text-xs text-muted-foreground">
                  {latest.itemCount} productos · {fmt(latest.estimatedTotal)}
                </p>
              </div>
              <Link
                href={`/compras/${latest.id}`}
                className={buttonVariants({ size: "sm", className: "shrink-0" })}
              >
                Continuar
              </Link>
            </div>
            {moreCount > 0 && (
              <Link href="/compras" className="mt-2 block text-xs text-orange-600 hover:underline dark:text-orange-400">
                +{moreCount} compra{moreCount > 1 ? "s" : ""} más en progreso → Ver todas
              </Link>
            )}
          </div>
        );
      })()}

      {/* Resumen del mes */}
      <div id="tour-summary" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Link href="/ingresos" className="rounded-xl border p-4 transition-colors hover:bg-muted/50">
          <p className="text-xs text-muted-foreground">Ingresos del mes</p>
          <p className="text-lg font-semibold text-green-600">{fmt(stats.monthlyIncome)}</p>
        </Link>
        <Link href="/gastos" className="rounded-xl border p-4 transition-colors hover:bg-muted/50">
          <p className="text-xs text-muted-foreground">Gastos del mes</p>
          <p className="text-lg font-semibold text-destructive">{fmt(stats.monthlyExpenses)}</p>
        </Link>
        <Link href="/prestamos" className="rounded-xl border p-4 transition-colors hover:bg-muted/50">
          <p className="text-xs text-muted-foreground">Préstamos del mes</p>
          <p className="text-lg font-semibold text-orange-600">{fmt(stats.monthlyLoans)}</p>
        </Link>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Balance proyectado</p>
          <p className={`text-lg font-semibold ${stats.projectedBalance >= 0 ? "text-green-600" : "text-destructive"}`}>
            {fmt(stats.projectedBalance)}
          </p>
        </div>
      </div>

      {/* Ahorro y deuda */}
      <div className="grid gap-4 grid-cols-2">
        <Link href="/ahorro" className="rounded-xl border p-4 transition-colors hover:bg-muted/50">
          <p className="text-xs text-muted-foreground">Ahorro acumulado</p>
          <p className="text-lg font-semibold text-green-600">{fmt(stats.totalSavings)}</p>
        </Link>
        <Link href="/prestamos" className="rounded-xl border p-4 transition-colors hover:bg-muted/50">
          <p className="text-xs text-muted-foreground">Deuda total</p>
          <p className="text-lg font-semibold text-destructive">{fmt(stats.totalDebt)}</p>
        </Link>
      </div>

      {/* Próximos eventos */}
      <div id="tour-upcoming" className="space-y-3">
        <h2 className="text-lg font-semibold">Próximos pagos e ingresos</h2>
        {stats.upcoming.length > 0 ? (
          <UpcomingEvents events={stats.upcoming} />
        ) : (
          <p className="text-sm text-muted-foreground">Sin eventos próximos. Registra tus ingresos y gastos para verlos aquí.</p>
        )}
      </div>

      {/* Accesos rápidos */}
      <div id="tour-shortcuts" className="space-y-3">
        <h2 className="text-lg font-semibold">Accesos rápidos</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <Link href="/ingresos" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <Banknote className="size-5" />
            Ingresos
          </Link>
          <Link href="/tarjetas" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <CreditCard className="size-5" />
            Tarjetas
          </Link>
          <Link href="/prestamos" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <Landmark className="size-5" />
            Préstamos
          </Link>
          <Link href="/gastos" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <FileText className="size-5" />
            Gastos
          </Link>
          <Link href="/gastos-diarios" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <Receipt className="size-5" />
            Gastos diarios
          </Link>
          <Link href="/ahorro" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <PiggyBank className="size-5" />
            Ahorro
          </Link>
          <Link href="/calendario" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <Calendar className="size-5" />
            Calendario
          </Link>
          <Link href="/dispersiones" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <ArrowLeftRight className="size-5" />
            Dispersiones
          </Link>
          <Link href="/compras" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <ShoppingCart className="size-5" />
            Compras
          </Link>
        </div>
      </div>
    </div>
  );
}
