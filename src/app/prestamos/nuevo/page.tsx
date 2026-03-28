import { LoanForm } from "@/components/loan/loan-form";
import { getLoanIncomeSourceOptions } from "@/lib/actions/loan";

export default async function NewLoanPage() {
  const incomeSources = await getLoanIncomeSourceOptions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo préstamo</h1>
      <LoanForm incomeSources={incomeSources} />
    </div>
  );
}
