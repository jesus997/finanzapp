import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { getDistributions, deleteDistribution } from "@/lib/actions/distribution";
import { DistributionCard } from "@/components/distribution/distribution-card";

export default async function DistributionsPage() {
  const distributions = await getDistributions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispersiones</h1>
        <Link href="/dispersiones/nueva" className={buttonVariants()}>
          Nueva dispersión
        </Link>
      </div>

      {distributions.length === 0 ? (
        <p className="text-muted-foreground">
          No tienes dispersiones registradas.
        </p>
      ) : (
        <div className="space-y-4">
          {distributions.map((dist) => (
            <div key={dist.id} className="space-y-2">
              <DistributionCard distribution={dist} />
              <form
                action={async () => {
                  "use server";
                  await deleteDistribution(dist.id);
                }}
              >
                <button
                  type="submit"
                  className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-destructive/10 px-2.5 text-[0.8rem] font-medium text-destructive hover:bg-destructive/20"
                >
                  Revertir
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
