import { auth } from "@/lib/auth";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getOnboardingStatus } from "@/lib/actions/onboarding";
import { OnboardingTour } from "@/components/onboarding-tour";
import { UpcomingEvents } from "@/components/upcoming-events";

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
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
            Ingresos
          </Link>
          <Link href="/tarjetas" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
            Tarjetas
          </Link>
          <Link href="/prestamos" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>
            Préstamos
          </Link>
          <Link href="/gastos" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            Gastos
          </Link>
          <Link href="/gastos-diarios" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            Gastos diarios
          </Link>
          <Link href="/ahorro" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" /></svg>
            Ahorro
          </Link>
          <Link href="/calendario" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            Calendario
          </Link>
          <Link href="/dispersiones" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
            Dispersiones
          </Link>
          <Link href="/compras" className={buttonVariants({ variant: "outline", className: "h-16 gap-2" })}>
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
            Compras
          </Link>
        </div>
      </div>
    </div>
  );
}
