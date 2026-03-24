import { notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { getShoppingSession } from "@/lib/actions/shopping";
import { getCards } from "@/lib/actions/card";
import { getIncomeSources } from "@/lib/actions/income-source";
import { ShoppingLiveList } from "@/components/shopping/shopping-live-list";
import { CompleteShoppingForm } from "@/components/shopping/complete-shopping-form";
import { SHOPPING_SESSION_STATUS_LABELS } from "@/lib/constants";

const fmt = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

export default async function ShoppingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, cards, incomeSources] = await Promise.all([
    getShoppingSession(id),
    getCards(),
    getIncomeSources(),
  ]);

  if (!session) notFound();

  const paymentOptions = [
    ...cards.map((c) => ({
      type: c.type === "CREDIT" ? "CREDIT_CARD" : "DEBIT_CARD",
      id: c.id,
      label: `${c.name} ••••${c.lastFourDigits}`,
    })),
    ...incomeSources.map((s) => ({
      type: "INCOME_SOURCE",
      id: s.id,
      label: s.name,
    })),
  ];

  if (session.status === "COMPLETED") {
    return (
      <div className="space-y-6 max-w-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{session.name}</h1>
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
            {SHOPPING_SESSION_STATUS_LABELS[session.status]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {session.storeName} · {new Date(session.date).toLocaleDateString("es-MX")}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Estimado</p>
            <p className="text-lg font-semibold">{fmt(session.estimatedTotal)}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Total pagado</p>
            <p className="text-lg font-semibold">{fmt(session.finalTotal ?? 0)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{session.items.length} productos</p>
          {session.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm">{item.name}</p>
                {item.quantity > 1 && <span className="text-xs text-muted-foreground">×{item.quantity}</span>}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{fmt(item.finalPrice ?? item.estimatedPrice)}</p>
                {item.finalPrice != null && item.finalPrice !== item.estimatedPrice * item.quantity && (
                  <p className="text-xs text-muted-foreground line-through">{fmt(item.estimatedPrice * item.quantity)}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Link href="/compras" className={buttonVariants({ variant: "outline" })}>
          ← Volver a compras
        </Link>
      </div>
    );
  }

  // IN_PROGRESS
  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{session.name}</h1>
          <p className="text-sm text-muted-foreground">{session.storeName}</p>
        </div>
        <Link href="/compras" className={buttonVariants({ variant: "outline", className: "text-xs h-8" })}>
          ← Compras
        </Link>
      </div>

      <ShoppingLiveList
        sessionId={session.id}
        storeId={session.storeId}
        initialItems={session.items}
        initialTotal={session.estimatedTotal}
      />

      {session.items.length > 0 && (
        <details className="rounded-xl border p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Completar compra
          </summary>
          <div className="mt-4">
            <CompleteShoppingForm
              sessionId={session.id}
              items={session.items.map((i) => ({
                id: i.id,
                name: i.name,
                estimatedPrice: i.estimatedPrice,
                quantity: i.quantity,
              }))}
              paymentOptions={paymentOptions}
            />
          </div>
        </details>
      )}
    </div>
  );
}
