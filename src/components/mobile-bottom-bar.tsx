"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileMenu } from "./mobile-menu";

const quickActions = [
  { href: "/ingresos/nuevo", label: "Ingreso", icon: "💰" },
  { href: "/tarjetas/nueva", label: "Tarjeta", icon: "💳" },
  { href: "/prestamos/nuevo", label: "Préstamo", icon: "🏦" },
  { href: "/gastos/nuevo", label: "Gasto fijo", icon: "📋" },
  { href: "/gastos-diarios/nuevo", label: "Gasto diario", icon: "🧾" },
  { href: "/ahorro/nuevo", label: "Ahorro", icon: "🐷" },
  { href: "/dispersiones/nueva", label: "Dispersión", icon: "📊" },
  { href: "/compras/nueva", label: "Compra", icon: "🛒" },
];

export function MobileBottomBar() {
  const [fabOpen, setFabOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      {/* FAB overlay */}
      {fabOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setFabOpen(false)}>
          <div className="absolute bottom-20 right-4 flex flex-col gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setFabOpen(false)}
                className="flex items-center gap-2 self-end rounded-full bg-background px-4 py-2 text-sm font-medium shadow-lg"
              >
                <span>{action.label}</span>
                <span className="text-base">{action.icon}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-14 items-center justify-around px-2">
          <MobileMenu />

          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}
          >
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
            <span className="text-[10px]">Inicio</span>
          </Link>

          <Link
            href="/calendario"
            className={`flex flex-col items-center gap-0.5 ${pathname === "/calendario" ? "text-primary" : "text-muted-foreground"}`}
          >
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px]">Calendario</span>
          </Link>

          {/* FAB */}
          <button
            onClick={() => setFabOpen(!fabOpen)}
            className={`flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg -mt-6 transition-transform ${fabOpen ? "rotate-45" : ""}`}
            aria-label="Agregar nuevo"
          >
            <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
