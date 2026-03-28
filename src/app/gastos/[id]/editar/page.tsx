import { notFound } from "next/navigation";
import { getRecurringExpense, getPaymentMethodOptions } from "@/lib/actions/recurring-expense";
import { RecurringExpenseForm } from "@/components/recurring-expense/recurring-expense-form";

export default async function EditRecurringExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [expense, { cards, incomeSources }] = await Promise.all([
    getRecurringExpense(id),
    getPaymentMethodOptions(),
  ]);

  if (!expense) notFound();

  const serialized = {
    id: expense.id,
    name: expense.name,
    description: expense.description,
    amount: Number(expense.amount),
    frequency: expense.frequency,
    payDay: expense.payDay,
    startDate: expense.startDate.toISOString(),
    endDate: expense.endDate?.toISOString() ?? null,
    paymentMethodType: expense.paymentMethodType,
    paymentMethodId: expense.paymentMethodId,
    category: expense.category,
    incomeSourceId: expense.incomeSourceId,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar gasto periódico</h1>
      <RecurringExpenseForm expense={serialized} cards={cards} incomeSources={incomeSources} />
    </div>
  );
}
