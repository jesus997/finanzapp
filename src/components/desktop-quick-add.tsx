"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const quickActions = [
  { href: "/ingresos/nuevo", label: "Ingreso", icon: "💰" },
  { href: "/tarjetas/nueva", label: "Tarjeta", icon: "💳" },
  { href: "/prestamos/nuevo", label: "Préstamo", icon: "🏦" },
  { href: "/gastos/nuevo", label: "Gasto periódico", icon: "📋" },
  { href: "/gastos-diarios/nuevo", label: "Gasto diario", icon: "🧾" },
  { href: "/ahorro/nuevo", label: "Ahorro", icon: "🐷" },
  { href: "/dispersiones/nueva", label: "Dispersión", icon: "📊" },
  { href: "/compras/nueva", label: "Compra", icon: "🛒" },
];

export function DesktopQuickAdd() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:bg-primary/90 ${open ? "rotate-45" : ""}`}
        aria-label="Agregar nuevo"
      >
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[200px] rounded-md border bg-background py-1 shadow-lg">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted"
            >
              <span>{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
