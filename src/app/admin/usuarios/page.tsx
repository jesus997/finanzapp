import { getAdminUsers } from "@/lib/actions/admin";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{users.length} usuarios registrados</p>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {users.map((u) => (
          <div key={u.id} className="rounded-xl border p-4 space-y-1">
            <div className="flex items-center gap-3">
              {u.image && <img src={u.image} alt="" className="size-8 rounded-full" />}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{u.name ?? "Sin nombre"}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Invitaciones: {u.invitationsUsed}/{u.invitationsSent}</span>
              {u.invitedByName && <span>Invitado por: {u.invitedByName}</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              Registro: {new Date(u.createdAt).toLocaleDateString("es-MX")}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 font-medium">Usuario</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Invitado por</th>
              <th className="pb-2 font-medium text-center">Invitaciones</th>
              <th className="pb-2 font-medium">Registro</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    {u.image && <img src={u.image} alt="" className="size-6 rounded-full" />}
                    {u.name ?? "Sin nombre"}
                  </div>
                </td>
                <td className="py-2 text-muted-foreground">{u.email}</td>
                <td className="py-2">{u.invitedByName ?? "—"}</td>
                <td className="py-2 text-center">{u.invitationsUsed}/{u.invitationsSent}</td>
                <td className="py-2 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("es-MX")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
