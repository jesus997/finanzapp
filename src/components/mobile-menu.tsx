"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

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
  { href: "/invitaciones", label: "Invitaciones", icon: "✉️" },
];

interface Props {
  user: { name: string | null; image: string | null };
  isAdmin?: boolean;
}

export function MobileMenu({ user, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
        const dist = Math.max(0, touchCurrentX.current - touchStartX.current);
        const pct = Math.min(dist / 280, 1);
        drawer.style.transform = `translateX(${-100 + pct * 100}%)`;
        drawer.style.transition = "none";
        drawer.parentElement!.style.visibility = "visible";
        drawer.parentElement!.style.opacity = String(pct * 0.5);
      } else {
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
        onClick={() => { setOpen(false); setShowAbout(false); }}
      >
        <nav
          ref={drawerRef}
          onClick={(e) => e.stopPropagation()}
          className={`absolute inset-y-0 left-0 flex w-[280px] flex-col bg-background shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Header */}
          <div className="flex h-14 items-center border-b px-4">
            <img src="/logo.svg" alt="FinanzApp" className="h-8 w-auto" />
          </div>

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-1">
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
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname.startsWith("/admin") ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted"}`}
                >
                  <span className="text-base">⚙️</span>
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Bottom section: profile + about */}
          <div className="border-t">
            {/* About panel */}
            {showAbout && (
              <div className="border-b bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Acerca de FinanzApp</p>
                  <button onClick={() => setShowAbout(false)} className="text-xs text-muted-foreground">✕</button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  App de gestión de finanzas personales. Controla tus tarjetas, préstamos, gastos e ingresos desde un solo lugar.
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Versión <span className="font-medium text-foreground">0.1.0</span></p>
                  {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ? (
                    <p>Deploy: <span className="font-mono font-medium text-foreground">{process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)}</span></p>
                  ) : (
                    <p>Deploy: <span className="font-medium text-foreground">local</span></p>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  ⚠️ Proyecto de hobby creado con agentes de IA. No se garantiza su mantenimiento, disponibilidad ni permanencia.
                </p>
                <a
                  href="https://github.com/jesus997/finanzapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Contribuir en GitHub
                </a>
              </div>
            )}

            {/* User profile row */}
            <div className="flex items-center gap-3 p-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "Usuario"}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name ?? "Usuario"}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex border-t">
              <button
                onClick={() => setShowAbout(!showAbout)}
                className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Info
              </button>
              <div className="w-px bg-border" />
              <button
                onClick={() => signOut()}
                className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs text-destructive hover:bg-muted transition-colors"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
