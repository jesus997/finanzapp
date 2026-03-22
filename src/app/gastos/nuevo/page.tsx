import { getPaymentMethodOptions } from "@/lib/actions/recurring-expense";
import { RecurringExpenseForm } from "@/components/recurring-expense/recurring-expense-form";

export default async function NewRecurringExpensePage() {
  const { cards, incomeSources } = await getPaymentMethodOptions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo gasto periódico</h1>
      <RecurringExpenseForm cards={cards} incomeSources={incomeSources} />
    </div>
  );
}
