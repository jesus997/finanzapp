import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/");

  const links = [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/usuarios", label: "Usuarios" },
    { href: "/admin/invitaciones", label: "Invitaciones" },
    { href: "/admin/productos", label: "Productos" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Admin
        </span>
      </div>
      <nav className="flex gap-1 overflow-x-auto rounded-lg border p-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
