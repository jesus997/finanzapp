import { getAdminInvitations } from "@/lib/actions/admin";

export default async function AdminInvitationsPage() {
  const invitations = await getAdminInvitations();
  const used = invitations.filter((i) => i.usedAt).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {invitations.length} invitaciones · {used} usadas · {invitations.length - used} pendientes
      </p>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {invitations.map((inv) => (
          <div key={inv.id} className="rounded-xl border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <code className="text-xs">{inv.code}</code>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${inv.usedAt ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                {inv.usedAt ? "Usada" : "Pendiente"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enviada por: {inv.inviterName ?? inv.inviterEmail}
            </p>
            {inv.usedByEmail && (
              <p className="text-xs text-muted-foreground">Usada por: {inv.usedByEmail}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(inv.createdAt).toLocaleDateString("es-MX")}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 font-medium">Código</th>
              <th className="pb-2 font-medium">Enviada por</th>
              <th className="pb-2 font-medium">Usada por</th>
              <th className="pb-2 font-medium">Estado</th>
              <th className="pb-2 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => (
              <tr key={inv.id} className="border-b">
                <td className="py-2"><code className="text-xs">{inv.code}</code></td>
                <td className="py-2">{inv.inviterName ?? inv.inviterEmail}</td>
                <td className="py-2 text-muted-foreground">{inv.usedByEmail ?? "—"}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${inv.usedAt ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                    {inv.usedAt ? "Usada" : "Pendiente"}
                  </span>
                </td>
                <td className="py-2 text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString("es-MX")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
