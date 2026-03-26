import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getExpenses, deleteExpense } from "@/lib/actions/expense";
import { EXPENSE_CATEGORY_LABELS, PAYMENT_METHOD_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency as fmt } from "@/lib/utils";

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  const fmtDate = (d: Date) => d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gastos diarios</h1>
        <Link href="/gastos-diarios/nuevo" className={buttonVariants()}>Agregar</Link>
      </div>

      {expenses.length === 0 ? (
        <p className="text-muted-foreground">No tienes gastos registrados.</p>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="grid gap-4 md:hidden">
            {expenses.map((exp) => (
              <div key={exp.id} className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{exp.name}</p>
                  {exp.category && (
                    <Badge variant="secondary" className="text-xs">
                      {EXPENSE_CATEGORY_LABELS[exp.category] ?? exp.category}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Monto</p>
                    <p className="font-medium">{fmt(Number(exp.amount))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha</p>
                    <p>{fmtDate(exp.date)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {PAYMENT_METHOD_TYPE_LABELS[exp.paymentMethodType]}
                </p>
                <div className="flex gap-2 pt-1">
                  <Link href={`/gastos-diarios/${exp.id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Editar
                  </Link>
                  <form action={async () => { "use server"; await deleteExpense(exp.id); }}>
                    <button type="submit" className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-destructive/10 px-2.5 text-[0.8rem] font-medium text-destructive hover:bg-destructive/20">
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Método de pago</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>
                      <p className="font-medium">{exp.name}</p>
                      {exp.description && <p className="text-xs text-muted-foreground">{exp.description}</p>}
                    </TableCell>
                    <TableCell>{fmt(Number(exp.amount))}</TableCell>
                    <TableCell>{fmtDate(exp.date)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{PAYMENT_METHOD_TYPE_LABELS[exp.paymentMethodType]}</Badge>
                    </TableCell>
                    <TableCell>{exp.category ? EXPENSE_CATEGORY_LABELS[exp.category] ?? exp.category : "—"}</TableCell>
                    <TableCell className="flex gap-2">
                      <Link href={`/gastos-diarios/${exp.id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Editar
                      </Link>
                      <form action={async () => { "use server"; await deleteExpense(exp.id); }}>
                        <button type="submit" className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-destructive/10 px-2.5 text-[0.8rem] font-medium text-destructive hover:bg-destructive/20">
                          Eliminar
                        </button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
