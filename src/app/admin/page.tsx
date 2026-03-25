import { getAdminStats } from "@/lib/actions/admin";

export default async function AdminPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Usuarios", value: stats.totalUsers, href: "/admin/usuarios" },
    { label: "Invitaciones", value: `${stats.usedInvitations}/${stats.totalInvitations}`, sub: "usadas" },
    { label: "Productos", value: stats.totalProducts, href: "/admin/productos" },
    { label: "Tiendas", value: stats.totalStores },
    { label: "Sesiones de compra", value: stats.totalShoppingSessions },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">{c.label}</p>
          <p className="text-2xl font-bold">{c.value}</p>
          {c.sub && <p className="text-xs text-muted-foreground">{c.sub}</p>}
        </div>
      ))}
    </div>
  );
}
