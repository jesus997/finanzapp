"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/ingresos", label: "Ingresos" },
  { href: "/tarjetas", label: "Tarjetas" },
  { href: "/prestamos", label: "Préstamos" },
  { href: "/gastos", label: "Gastos" },
  { href: "/gastos-diarios", label: "Gastos diarios" },
  { href: "/ahorro", label: "Ahorro" },
  { href: "/calendario", label: "Calendario" },
  { href: "/dispersiones", label: "Dispersiones" },
  { href: "/compras", label: "Compras" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
        aria-label="Menú"
      >
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-14 z-50 border-b bg-background p-4">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
