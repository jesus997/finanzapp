import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";
import { MobileMenu } from "@/components/mobile-menu";

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
            <div className="hidden items-center gap-4 md:flex">
              <Link href="/ingresos" className="text-sm hover:underline">Ingresos</Link>
              <Link href="/tarjetas" className="text-sm hover:underline">Tarjetas</Link>
              <Link href="/prestamos" className="text-sm hover:underline">Préstamos</Link>
              <Link href="/gastos" className="text-sm hover:underline">Gastos</Link>
              <Link href="/ahorro" className="text-sm hover:underline">Ahorro</Link>
              <Link href="/calendario" className="text-sm hover:underline">Calendario</Link>
              <Link href="/dispersiones" className="text-sm hover:underline">Dispersiones</Link>
              <span className="text-sm text-muted-foreground">{session.user.name}</span>
              <form action={async () => { "use server"; await signOut(); }}>
                <button className="text-sm text-muted-foreground hover:underline">Salir</button>
              </form>
            </div>
            <div className="flex items-center gap-3 md:hidden">
              <form action={async () => { "use server"; await signOut(); }}>
                <button className="text-xs text-muted-foreground hover:underline">Salir</button>
              </form>
              <MobileMenu />
            </div>
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
