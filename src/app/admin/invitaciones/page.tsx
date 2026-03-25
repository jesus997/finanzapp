import { getAdminInvitations, createAdminInvitation, deleteAdminInvitation } from "@/lib/actions/admin";
import { CopyButton } from "@/components/copy-button";
import { headers } from "next/headers";

export default async function AdminInvitationsPage() {
  const invitations = await getAdminInvitations();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const totalUses = invitations.reduce((s, i) => s + i.useCount, 0);

  function status(inv: (typeof invitations)[0]) {
    const max = inv.maxUses ?? 1;
    if (max === 0) return { label: `${inv.useCount} usos · Ilimitada`, exhausted: false, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    if (inv.useCount >= max) return { label: "Agotada", exhausted: true, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    if (inv.useCount > 0) return { label: `${inv.useCount}/${max} usos`, exhausted: false, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { label: "Pendiente", exhausted: false, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {invitations.length} invitaciones · {totalUses} registros totales
      </p>

      {/* Create invitation form */}
      <form action={createAdminInvitation} className="rounded-xl border p-4 space-y-3">
        <p className="text-sm font-medium">Crear invitación</p>
        <input
          name="label"
          placeholder="Etiqueta (opcional, ej: Influencer X)"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <div>
          <label className="text-xs text-muted-foreground">Máximo de usos (0 = ilimitado, vacío = 1 uso)</label>
          <input
            name="maxUses"
            type="number"
            min="0"
            placeholder="1"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Generar invitación
        </button>
      </form>

      {/* Invitations list */}
      <div className="space-y-3">
        {invitations.map((inv) => {
          const url = `${baseUrl}/invitar/${inv.code}`;
          const s = status(inv);
          return (
            <div key={inv.id} className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${s.color}`}>
                    {s.label}
                  </span>
                  {inv.label && <span className="text-sm font-medium truncate">{inv.label}</span>}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(inv.createdAt).toLocaleDateString("es-MX")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Por: {inv.inviterName ?? inv.inviterEmail}
                {inv.usedByEmail && ` · Último uso: ${inv.usedByEmail}`}
              </p>
              {!s.exhausted && (
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={url}
                    className="flex-1 rounded-md border bg-muted px-3 py-1.5 text-xs font-mono"
                  />
                  <CopyButton text={url} />
                </div>
              )}
              {inv.useCount === 0 && (
                <form action={deleteAdminInvitation.bind(null, inv.id)}>
                  <button type="submit" className="text-xs text-destructive hover:underline">Eliminar</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
