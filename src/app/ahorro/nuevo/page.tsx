import { getIncomeSourceOptions } from "@/lib/actions/savings-fund";
import { SavingsFundForm } from "@/components/savings-fund/savings-fund-form";

export default async function NewSavingsFundPage() {
  const incomeSources = await getIncomeSourceOptions();

  const serialized = incomeSources.map((s) => ({
    id: s.id,
    name: s.name,
    amount: Number(s.amount),
    frequency: s.frequency,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo apartado de ahorro</h1>
      <SavingsFundForm incomeSources={serialized} />
    </div>
  );
}
