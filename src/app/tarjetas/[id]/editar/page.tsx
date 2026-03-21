import { notFound } from "next/navigation";
import { getCard } from "@/lib/actions/card";
import { CardForm } from "@/components/card/card-form";

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) notFound();

  const serialized = {
    ...card,
    creditLimit: card.creditLimit ? Number(card.creditLimit) : null,
    interestRate: card.interestRate ? Number(card.interestRate) : null,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar tarjeta</h1>
      <CardForm card={serialized} />
    </div>
  );
}
