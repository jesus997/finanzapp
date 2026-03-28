import { notFound } from "next/navigation";
import { getSavingsFund, getIncomeSourceOptions } from "@/lib/actions/savings-fund";
import { SavingsFundForm } from "@/components/savings-fund/savings-fund-form";

export default async function EditSavingsFundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [fund, incomeSources] = await Promise.all([
    getSavingsFund(id),
    getIncomeSourceOptions(),
  ]);

  if (!fund) notFound();

  const serialized = {
    id: fund.id,
    name: fund.name,
    type: fund.type,
    value: Number(fund.value),
    frequency: fund.frequency,
    incomeSourceId: fund.incomeSourceId ?? "",
    accumulatedBalance: Number(fund.accumulatedBalance),
    targetAmount: fund.targetAmount ? Number(fund.targetAmount) : null,
    targetDate: fund.targetDate ? fund.targetDate.toISOString() : null,
    completedAt: fund.completedAt ? fund.completedAt.toISOString() : null,
  };

  const serializedSources = incomeSources.map((s) => ({
    id: s.id,
    name: s.name,
    amount: Number(s.amount),
    frequency: s.frequency,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar apartado de ahorro</h1>
      <SavingsFundForm fund={serialized} incomeSources={serializedSources} />
    </div>
  );
}
