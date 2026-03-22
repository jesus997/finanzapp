import { getActiveIncomeSources } from "@/lib/actions/distribution";
import { NewDistributionForm } from "@/components/distribution/new-distribution-form";

export default async function NewDistributionPage() {
  const incomeSources = await getActiveIncomeSources();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nueva dispersión</h1>
      <NewDistributionForm incomeSources={incomeSources} />
    </div>
  );
}
