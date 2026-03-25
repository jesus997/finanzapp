"use client";

import { useState } from "react";

export function BetaBadge() {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
      >
        BETA
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-3 text-sm shadow-md">
            <p className="font-medium">Versión beta</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Esta aplicación está en desarrollo activo. Los cálculos y datos mostrados pueden contener errores.
              Valida siempre la información antes de tomar decisiones financieras.
            </p>
          </div>
        </>
      )}
    </span>
  );
}
