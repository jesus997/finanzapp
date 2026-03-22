import { notFound } from "next/navigation";
import { getExpense } from "@/lib/actions/expense";
import { getPaymentMethodOptions } from "@/lib/actions/recurring-expense";
import { ExpenseForm } from "@/components/expense/expense-form";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [expense, { cards, incomeSources }] = await Promise.all([
    getExpense(id),
    getPaymentMethodOptions(),
  ]);

  if (!expense) notFound();

  const serialized = {
    id: expense.id,
    name: expense.name,
    description: expense.description,
    amount: Number(expense.amount),
    date: expense.date.toISOString().slice(0, 10),
    category: expense.category,
    paymentMethodType: expense.paymentMethodType,
    paymentMethodId: expense.paymentMethodId,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar gasto</h1>
      <ExpenseForm cards={cards} incomeSources={incomeSources} expense={serialized} />
    </div>
  );
}
