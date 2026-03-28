import { notFound } from "next/navigation";
import { getLoan, getLoanIncomeSourceOptions } from "@/lib/actions/loan";
import { LoanForm } from "@/components/loan/loan-form";

export default async function EditLoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [loan, incomeSources] = await Promise.all([
    getLoan(id),
    getLoanIncomeSourceOptions(),
  ]);

  if (!loan) notFound();

  const serialized = {
    id: loan.id,
    name: loan.name,
    type: loan.type,
    institution: loan.institution,
    totalAmount: Number(loan.totalAmount),
    paymentAmount: Number(loan.paymentAmount),
    paymentFrequency: loan.paymentFrequency,
    interestRate: Number(loan.interestRate),
    remainingBalance: Number(loan.remainingBalance),
    startDate: loan.startDate.toISOString(),
    endDate: loan.endDate?.toISOString() ?? null,
    cutOffDay: loan.cutOffDay,
    paymentDueDay: loan.paymentDueDay,
    incomeSourceId: loan.incomeSourceId,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar préstamo</h1>
      <LoanForm loan={serialized} incomeSources={incomeSources} />
    </div>
  );
}
