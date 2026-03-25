import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { getCardsWithExpenses, deleteCard } from "@/lib/actions/card";
import { CARD_TYPE_LABELS, CARD_NETWORK_LABELS } from "@/lib/constants";
import { CardExpensesList } from "@/components/card/card-expenses-list";

export default async function CardsPage() {
  const cards = await getCardsWithExpenses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tarjetas</h1>
        <Link href="/tarjetas/nueva" className={buttonVariants()}>
          Agregar
        </Link>
      </div>

      {cards.length === 0 ? (
        <p className="text-muted-foreground">
          No tienes tarjetas registradas.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="rounded-xl border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{card.name}</p>
                  <p className="text-sm text-muted-foreground">{card.bank}</p>
                </div>
                <div className="flex gap-1.5">
                  <Badge variant="secondary">
                    {CARD_NETWORK_LABELS[card.network]}
                  </Badge>
                  <Badge variant={card.type === "CREDIT" ? "default" : "secondary"}>
                    {CARD_TYPE_LABELS[card.type]}
                  </Badge>
                </div>
              </div>

              <p className="text-lg font-mono tracking-widest">
                •••• {card.lastFourDigits}
              </p>

              {card.type === "CREDIT" && (
                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs">Límite</p>
                    <p className="font-medium text-foreground">
                      ${Number(card.creditLimit).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs">Corte</p>
                    <p className="font-medium text-foreground">Día {card.cutOffDay}</p>
                  </div>
                  <div>
                    <p className="text-xs">Pago</p>
                    <p className="font-medium text-foreground">Día {card.paymentDay}</p>
                  </div>
                  {card.currentBalance != null && (
                    <div>
                      <p className="text-xs">Saldo actual</p>
                      <p className="font-medium text-destructive">
                        ${Number(card.currentBalance).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {card.monthlyPayment != null && (
                    <div>
                      <p className="text-xs">Pago mensual</p>
                      <p className="font-medium text-foreground">
                        ${Number(card.monthlyPayment).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {card.currentBalance != null && card.creditLimit != null && (
                    <div>
                      <p className="text-xs">Disponible</p>
                      <p className="font-medium text-green-600">
                        ${(Number(card.creditLimit) - Number(card.currentBalance)).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <CardExpensesList
                cardName={card.name}
                expenses={card.expenses}
                dailyExpenses={card.dailyExpenses}
              />

              <div className="flex gap-2 pt-1">
                <Link
                  href={`/tarjetas/${card.id}/editar`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Editar
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteCard(card.id);
                  }}
                >
                  <button type="submit" className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-destructive/10 px-2.5 text-[0.8rem] font-medium text-destructive hover:bg-destructive/20">
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
