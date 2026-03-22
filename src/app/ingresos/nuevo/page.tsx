import { IncomeSourceForm } from "@/components/income-source/income-source-form";
import { getDebitCards } from "@/lib/actions/income-source";

export default async function NewIncomePage() {
  const debitCards = await getDebitCards();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nueva fuente de ingreso</h1>
      <IncomeSourceForm debitCards={debitCards} />
    </div>
  );
}
