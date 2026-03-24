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
          const used = !!inv.usedAt;
          return (
            <div key={inv.id} className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`rounded px-2 py-0.5 text-xs ${used ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {used ? "Usada" : "Pendiente"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {inv.createdAt.toLocaleDateString("es-MX")}
                </span>
              </div>
              {used && inv.usedByEmail && (
                <p className="text-xs text-muted-foreground">Usada por: {inv.usedByEmail}</p>
              )}
              {!used && (
                <>
                  <input
                    readOnly
                    value={url}
                    className="w-full rounded-md border bg-muted px-3 py-1.5 text-xs font-mono"
                  />
                  <div className="flex gap-3">
                    <CopyButton text={url} />
                    <form action={deleteInvitation.bind(null, inv.id)}>
                      <button type="submit" className="text-xs text-destructive hover:underline">
                        Eliminar
                      </button>
                    </form>
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
