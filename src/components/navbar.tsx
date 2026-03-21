import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          FinanzApp
        </Link>
        {session?.user ? (
          <div className="flex items-center gap-4">
            <Link href="/ingresos" className="text-sm hover:underline">
              Ingresos
            </Link>
            <Link href="/tarjetas" className="text-sm hover:underline">
              Tarjetas
            </Link>
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="text-sm text-muted-foreground hover:underline">
                Salir
              </button>
            </form>
          </div>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <button className="text-sm hover:underline">
              Iniciar sesión con GitHub
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}
