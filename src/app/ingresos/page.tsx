import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getIncomeSources, deleteIncomeSource } from "@/lib/actions/income-source";
import { INCOME_TYPE_LABELS, FREQUENCY_LABELS, WEEKDAY_LABELS, MONTH_LABELS } from "@/lib/constants";

function formatPayDay(source: { payDayType: string; payDay: number[]; payMonth: number[]; frequency: string; oneTimeDate: Date | null }) {
  if (source.frequency === "ONE_TIME" && source.oneTimeDate) {
    return source.oneTimeDate.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  }
  if (source.payDayType === "DAY_OF_WEEK") {
    return source.payDay.map((d) => WEEKDAY_LABELS[d]).join(", ");
  }
  if (source.payMonth.length > 0) {
    return source.payDay.map((d, i) => `${d} de ${MONTH_LABELS[source.payMonth[i]] ?? ""}`).join(", ");
  }
  return source.payDay.join(", ");
}

export default async function IncomePage() {
  const sources = await getIncomeSources();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fuentes de ingreso</h1>
        <Link href="/ingresos/nuevo" className={buttonVariants()}>
          Agregar
        </Link>
      </div>

      {sources.length === 0 ? (
        <p className="text-muted-foreground">
          No tienes fuentes de ingreso registradas.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Frecuencia</TableHead>
              <TableHead>Día(s) de pago</TableHead>
              <TableHead>Depósito en</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell className="font-medium">{source.name}</TableCell>
                <TableCell>{INCOME_TYPE_LABELS[source.type]}</TableCell>
                <TableCell>
                  {source.isVariable && "~"}$
                  {Number(source.amount).toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>{FREQUENCY_LABELS[source.frequency]}</TableCell>
                <TableCell>{formatPayDay(source)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {source.depositCard
                    ? `${source.depositCard.name} (••••${source.depositCard.lastFourDigits})`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={source.active ? "default" : "secondary"}>
                    {source.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Link
                    href={`/ingresos/${source.id}/editar`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Editar
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteIncomeSource(source.id);
                    }}
                  >
                    <button type="submit" className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-destructive/10 px-2.5 text-[0.8rem] font-medium text-destructive hover:bg-destructive/20">
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
