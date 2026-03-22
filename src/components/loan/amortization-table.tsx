"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { AmortizationRow } from "@/lib/utils/amortization";

const fmt = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

const PAGE_SIZE = 12;

interface Props {
  schedule: AmortizationRow[];
  paymentAmount: number;
}

export function AmortizationTable({ schedule, paymentAmount }: Props) {
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? schedule : schedule.slice(0, PAGE_SIZE);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Tabla de amortización</h2>
      <div className="rounded-xl border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Periodo</TableHead>
              <TableHead className="text-right">Pago</TableHead>
              <TableHead className="text-right">Interés</TableHead>
              <TableHead className="text-right">Capital</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.period}>
                <TableCell>{row.period}</TableCell>
                <TableCell className="text-right">{fmt(paymentAmount)}</TableCell>
                <TableCell className="text-right text-destructive">{fmt(row.interest)}</TableCell>
                <TableCell className="text-right text-green-600">{fmt(row.principal)}</TableCell>
                <TableCell className="text-right">{fmt(row.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {schedule.length > PAGE_SIZE && (
        <Button variant="outline" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Mostrar menos" : `Ver los ${schedule.length} meses`}
        </Button>
      )}
    </div>
  );
}
