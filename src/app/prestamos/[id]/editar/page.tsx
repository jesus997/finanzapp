import { notFound } from "next/navigation";
import { getLoan } from "@/lib/actions/loan";
import { LoanForm } from "@/components/loan/loan-form";

export default async function EditLoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loan = await getLoan(id);

  if (!loan) notFound();

  const serialized = {
    id: loan.id,
    name: loan.name,
    type: loan.type,
    institution: loan.institution,
    totalAmount: Number(loan.totalAmount),
    monthlyPayment: Number(loan.monthlyPayment),
    interestRate: Number(loan.interestRate),
    remainingBalance: Number(loan.remainingBalance),
    startDate: loan.startDate.toISOString(),
    endDate: loan.endDate?.toISOString() ?? null,
    cutOffDay: loan.cutOffDay,
    paymentDueDay: loan.paymentDueDay,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar préstamo</h1>
      <LoanForm loan={serialized} />
    </div>
  );
}
