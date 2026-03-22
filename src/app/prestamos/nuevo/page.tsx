import { LoanForm } from "@/components/loan/loan-form";

export default function NewLoanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo préstamo</h1>
      <LoanForm />
    </div>
  );
}
