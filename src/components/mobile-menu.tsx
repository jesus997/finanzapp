"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/ingresos", label: "Ingresos", icon: "💰" },
  { href: "/tarjetas", label: "Tarjetas", icon: "💳" },
  { href: "/prestamos", label: "Préstamos", icon: "🏦" },
  { href: "/gastos", label: "Gastos periódicos", icon: "📋" },
  { href: "/gastos-diarios", label: "Gastos diarios", icon: "🧾" },
  { href: "/ahorro", label: "Ahorro", icon: "🐷" },
  { href: "/calendario", label: "Calendario", icon: "📅" },
  { href: "/dispersiones", label: "Dispersiones", icon: "📊" },
  { href: "/compras", label: "Compras", icon: "🛒" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isDragging = useRef(false);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Swipe-to-open: listen on left edge of screen
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      if (!open && x < 24) {
        isDragging.current = true;
        touchStartX.current = x;
        touchCurrentX.current = x;
      } else if (open) {
        isDragging.current = true;
        touchStartX.current = x;
        touchCurrentX.current = x;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      touchCurrentX.current = e.touches[0].clientX;
      const drawer = drawerRef.current;
      if (!drawer) return;

      if (!open) {
        // Opening: translate from -100% based on drag distance
        const dist = Math.max(0, touchCurrentX.current - touchStartX.current);
        const pct = Math.min(dist / 280, 1);
        drawer.style.transform = `translateX(${-100 + pct * 100}%)`;
        drawer.style.transition = "none";
        drawer.parentElement!.style.visibility = "visible";
        drawer.parentElement!.style.opacity = String(pct * 0.5);
      } else {
        // Closing: translate based on leftward drag
        const dist = Math.min(0, touchCurrentX.current - touchStartX.current);
        const pct = Math.max(0, 1 + dist / 280);
        drawer.style.transform = `translateX(${(1 - pct) * -100}%)`;
        drawer.style.transition = "none";
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const drawer = drawerRef.current;
      if (!drawer) return;
      drawer.style.transition = "";
      drawer.style.transform = "";
      if (drawer.parentElement) {
        drawer.parentElement.style.opacity = "";
        drawer.parentElement.style.visibility = "";
      }

      const diff = touchCurrentX.current - touchStartX.current;
      if (!open && diff > 80) setOpen(true);
      else if (open && diff < -80) setOpen(false);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [open]);

  return (
    <>
      {/* Menu button — rendered in MobileBottomBar */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-0.5 text-muted-foreground"
        aria-label="Menú"
      >
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="text-[10px]">Menú</span>
      </button>

      {/* Overlay + Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${open ? "visible bg-black/50" : "invisible"}`}
        onClick={() => setOpen(false)}
      >
        <nav
          ref={drawerRef}
          onClick={(e) => e.stopPropagation()}
          className={`absolute inset-y-0 left-0 w-[280px] bg-background shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-14 items-center border-b px-4">
            <span className="text-lg font-semibold">FinanzApp</span>
          </div>
          <div className="flex flex-col gap-1 p-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 3.5rem)" }}>
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted"}`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
