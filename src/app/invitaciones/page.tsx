import { getInvitations, getInvitationCount, createInvitation, deleteInvitation } from "@/lib/actions/invitation";
import { CopyButton } from "@/components/copy-button";
import { headers } from "next/headers";

const MAX = 10;

export default async function InvitationsPage() {
  const [invitations, count] = await Promise.all([getInvitations(), getInvitationCount()]);
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invitaciones</h1>
        <span className="text-sm text-muted-foreground">{count}/{MAX} usadas</span>
      </div>

      <p className="text-sm text-muted-foreground">
        Genera enlaces de invitación para que otros usuarios puedan crear su cuenta en FinanzApp.
      </p>

      {count < MAX && (
        <form action={createInvitation}>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Generar invitación
          </button>
        </form>
      )}

      <div className="space-y-3">
        {invitations.map((inv) => {
          const url = `${baseUrl}/invitar/${inv.code}`;
          const maxUses = inv.maxUses ?? 1;
          const exhausted = inv.useCount >= maxUses;
          return (
            <div key={inv.id} className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`rounded px-2 py-0.5 text-xs ${exhausted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {exhausted ? "Usada" : maxUses > 1 ? `${inv.useCount}/${maxUses} usos` : "Pendiente"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {inv.createdAt.toLocaleDateString("es-MX")}
                </span>
              </div>
              {inv.label && <p className="text-xs font-medium">{inv.label}</p>}
              {exhausted && inv.usedByEmail && maxUses <= 1 && (
                <p className="text-xs text-muted-foreground">Usada por: {inv.usedByEmail}</p>
              )}
              {!exhausted && (
                <>
                  <input
                    readOnly
                    value={url}
                    className="w-full rounded-md border bg-muted px-3 py-1.5 text-xs font-mono"
                  />
                  <div className="flex gap-3">
                    <CopyButton text={url} />
                    {inv.useCount === 0 && (
                      <form action={deleteInvitation.bind(null, inv.id)}>
                        <button type="submit" className="text-xs text-destructive hover:underline">
                          Eliminar
                        </button>
                      </form>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
        {invitations.length === 0 && (
          <p className="text-sm text-muted-foreground">No has generado invitaciones aún.</p>
        )}
      </div>
    </div>
  );
}
