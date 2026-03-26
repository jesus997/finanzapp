import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { getShoppingSessions } from "@/lib/actions/shopping";
import { SHOPPING_SESSION_STATUS_LABELS } from "@/lib/constants";
import { deleteShoppingSession } from "@/lib/actions/shopping";
import { formatCurrency as fmt } from "@/lib/utils";

export default async function ShoppingPage() {
  const sessions = await getShoppingSessions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compras</h1>
        <Link href="/compras/nueva" className={buttonVariants()}>
          Nueva compra
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-muted-foreground">
          No hay compras registradas. Inicia una nueva compra para empezar.
        </p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-4 md:hidden">
            {sessions.map((s) => (
              <div key={s.id} className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Link href={`/compras/${s.id}`} className="font-medium hover:underline">
                    {s.name}
                  </Link>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      s.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {SHOPPING_SESSION_STATUS_LABELS[s.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {s.storeName} · {s.itemCount} productos
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {s.finalTotal != null ? fmt(s.finalTotal) : fmt(s.estimatedTotal)}
                    {s.finalTotal == null && s.estimatedTotal > 0 && (
                      <span className="text-muted-foreground"> (est.)</span>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(s.date).toLocaleDateString("es-MX")}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Link href={`/compras/${s.id}`} className={buttonVariants({ variant: "outline", className: "flex-1 text-xs h-8" })}>
                    Ver
                  </Link>
                  <form action={async () => { "use server"; await deleteShoppingSession(s.id); }}>
                    <button type="submit" className="rounded-md border px-3 h-8 text-xs text-destructive hover:bg-destructive/10">
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Nombre</th>
                  <th className="pb-2 font-medium">Tienda</th>
                  <th className="pb-2 font-medium">Productos</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="py-3">
                      <Link href={`/compras/${s.id}`} className="hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="py-3">{s.storeName}</td>
                    <td className="py-3">{s.itemCount}</td>
                    <td className="py-3">
                      {s.finalTotal != null ? fmt(s.finalTotal) : fmt(s.estimatedTotal)}
                      {s.finalTotal == null && s.estimatedTotal > 0 && (
                        <span className="text-muted-foreground"> (est.)</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          s.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {SHOPPING_SESSION_STATUS_LABELS[s.status]}
                      </span>
                    </td>
                    <td className="py-3">{new Date(s.date).toLocaleDateString("es-MX")}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Link href={`/compras/${s.id}`} className={buttonVariants({ variant: "outline", className: "text-xs h-8" })}>
                          Ver
                        </Link>
                        <form action={async () => { "use server"; await deleteShoppingSession(s.id); }}>
                          <button type="submit" className="rounded-md border px-3 h-8 text-xs text-destructive hover:bg-destructive/10">
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
