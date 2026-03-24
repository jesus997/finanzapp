import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";
import { DesktopNavDropdown } from "@/components/desktop-nav-dropdown";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="relative border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          FinanzApp
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
                ]}
              />
              <div className="ml-2 flex items-center gap-3 border-l pl-3">
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
