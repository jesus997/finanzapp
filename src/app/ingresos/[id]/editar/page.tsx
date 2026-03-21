import { notFound } from "next/navigation";
import { getIncomeSource } from "@/lib/actions/income-source";
import { IncomeSourceForm } from "@/components/income-source/income-source-form";

export default async function EditIncomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incomeSource = await getIncomeSource(id);

  if (!incomeSource) notFound();

  const serialized = {
    ...incomeSource,
    amount: Number(incomeSource.amount),
    oneTimeDate: incomeSource.oneTimeDate?.toISOString() ?? null,
    createdAt: incomeSource.createdAt.toISOString(),
    updatedAt: incomeSource.updatedAt.toISOString(),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar fuente de ingreso</h1>
      <IncomeSourceForm incomeSource={serialized} />
    </div>
  );
}
