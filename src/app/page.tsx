import { auth } from "@/lib/auth";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">FinanzApp</h1>
        <p className="text-muted-foreground">
          Gestión de finanzas personales
        </p>
        <p className="text-sm text-muted-foreground">
          Inicia sesión para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Hola, {session.user.name ?? "usuario"}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/ingresos"
          className={buttonVariants({ variant: "outline", className: "h-24 text-lg" })}
        >
          Fuentes de ingreso
        </Link>
        <Link
          href="/tarjetas"
          className={buttonVariants({ variant: "outline", className: "h-24 text-lg" })}
        >
          Tarjetas
        </Link>
      </div>
    </div>
  );
}
