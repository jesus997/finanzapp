import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";
import { DesktopNavDropdown } from "@/components/desktop-nav-dropdown";
import { DesktopQuickAdd } from "@/components/desktop-quick-add";
import { BetaBadge } from "@/components/beta-badge";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function Navbar() {
  const session = await auth();
  const admin = isAdmin(session?.user?.email);

  return (
    <nav className="relative border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-icon.svg" alt="" className="size-7" />
          <span className="text-lg font-semibold">FinanzApp</span>
          <BetaBadge />
        </Link>
        {session?.user ? (
          <>
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/ingresos" className="rounded-md px-3 py-1.5 text-sm hover:bg-muted">Ingresos</Link>
              <Link href="/tarjetas" className="rounded-md px-3 py-1.5 text-sm hover:bg-muted">Tarjetas</Link>
              <Link href="/prestamos" className="rounded-md px-3 py-1.5 text-sm hover:bg-muted">Préstamos</Link>
              <DesktopNavDropdown
                label="Gastos"
                items={[
                  { href: "/gastos", label: "Periódicos" },
                  { href: "/gastos-diarios", label: "Diarios" },
                  { href: "/compras", label: "Compras" },
                ]}
              />
              <DesktopNavDropdown
                label="Más"
                items={[
                  { href: "/ahorro", label: "Ahorro" },
                  { href: "/calendario", label: "Calendario" },
                  { href: "/dispersiones", label: "Dispersiones" },
                  { href: "/invitaciones", label: "Invitaciones" },
                  ...(admin ? [{ href: "/admin", label: "⚙️ Admin" }] : []),
                ]}
              />
              <div className="ml-2 flex items-center gap-3 border-l pl-3">
                <DesktopQuickAdd />
                <span className="text-sm text-muted-foreground">{session.user.name}</span>
                <form action={async () => { "use server"; await signOut(); }}>
                  <button className="text-sm text-muted-foreground hover:underline">Salir</button>
                </form>
              </div>
            </div>
            {/* Mobile: navigation is in the drawer menu */}
          </>
        ) : (
          <form action={async () => { "use server"; await signIn(); }}>
            <button className="text-sm hover:underline">Iniciar sesión</button>
          </form>
        )}
      </div>
    </nav>
  );
}
