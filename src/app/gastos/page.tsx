import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRecurringExpenses } from "@/lib/actions/recurring-expense";
import { deleteRecurringExpense } from "@/lib/actions/recurring-expense";
import {
  FREQUENCY_LABELS,
  PAYMENT_METHOD_TYPE_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from "@/lib/constants";

export default async function RecurringExpensesPage() {
  const expenses = await getRecurringExpenses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gastos periódicos</h1>
        <Link href="/gastos/nuevo" className={buttonVariants()}>
          Agregar
        </Link>
      </div>

      {expenses.length === 0 ? (
        <p className="text-muted-foreground">
          No tienes gastos periódicos registrados.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Frecuencia</TableHead>
              <TableHead>Método de pago</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <p className="font-medium">{expense.name}</p>
                  {expense.description && (
                    <p className="text-xs text-muted-foreground">{expense.description}</p>
                  )}
                </TableCell>
                <TableCell>
                  ${Number(expense.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{FREQUENCY_LABELS[expense.frequency]}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {PAYMENT_METHOD_TYPE_LABELS[expense.paymentMethodType]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {expense.category ? EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category : "—"}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Link
                    href={`/gastos/${expense.id}/editar`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Editar
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteRecurringExpense(expense.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-destructive/10 px-2.5 text-[0.8rem] font-medium text-destructive hover:bg-destructive/20"
                    >
                      Eliminar
                    </button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
