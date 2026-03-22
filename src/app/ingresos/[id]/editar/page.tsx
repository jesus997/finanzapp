import { notFound } from "next/navigation";
import { getIncomeSource, getDebitCards } from "@/lib/actions/income-source";
import { IncomeSourceForm } from "@/components/income-source/income-source-form";

export default async function EditIncomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [incomeSource, debitCards] = await Promise.all([
    getIncomeSource(id),
    getDebitCards(),
  ]);

  if (!incomeSource) notFound();

  const serialized = {
    id: incomeSource.id,
    name: incomeSource.name,
    type: incomeSource.type,
    amount: Number(incomeSource.amount),
    frequency: incomeSource.frequency,
    payDayType: incomeSource.payDayType,
    payDay: incomeSource.payDay,
    payMonth: incomeSource.payMonth,
    isVariable: incomeSource.isVariable,
    oneTimeDate: incomeSource.oneTimeDate?.toISOString() ?? null,
    depositCardId: incomeSource.depositCardId,
    active: incomeSource.active,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar fuente de ingreso</h1>
      <IncomeSourceForm incomeSource={serialized} debitCards={debitCards} />
    </div>
  );
}
