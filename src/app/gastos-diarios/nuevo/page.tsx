import { getPaymentMethodOptions } from "@/lib/actions/recurring-expense";
import { ExpenseForm } from "@/components/expense/expense-form";

export default async function NewExpensePage() {
  const { cards, incomeSources } = await getPaymentMethodOptions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo gasto</h1>
      <ExpenseForm cards={cards} incomeSources={incomeSources} />
    </div>
  );
}
