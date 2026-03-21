import { IncomeSourceForm } from "@/components/income-source/income-source-form";

export default function NewIncomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nueva fuente de ingreso</h1>
      <IncomeSourceForm />
    </div>
  );
}
