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
    ...fund,
    value: Number(fund.value),
    accumulatedBalance: Number(fund.accumulatedBalance),
    createdAt: fund.createdAt.toISOString(),
    updatedAt: fund.updatedAt.toISOString(),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar apartado de ahorro</h1>
      <SavingsFundForm fund={serialized} incomeSources={incomeSources} />
    </div>
  );
}
