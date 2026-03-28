import { z } from "zod";

export const loanSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    type: z.enum(["BANK", "PAYROLL", "AUTO", "INFONAVIT", "MORTGAGE", "OTHER"]),
    institution: z.string().min(1, "La institución es requerida"),
    totalAmount: z.coerce.number().positive("El monto total debe ser mayor a 0"),
    paymentAmount: z.coerce.number().positive("El monto del pago debe ser mayor a 0"),
    paymentFrequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]).default("MONTHLY"),
    interestRate: z.coerce.number().min(0, "La tasa no puede ser negativa").default(0),
    startDate: z.coerce.date({ error: "La fecha de inicio es requerida" }),
    endDate: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : v),
      z.coerce.date().optional()
    ),
    cutOffDay: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : v),
      z.coerce.number().int().min(1).max(31, "Día de corte entre 1 y 31").optional()
    ),
    paymentDueDay: z.coerce.number().int().min(1).max(31, "Día límite de pago entre 1 y 31"),
    remainingBalance: z.coerce.number().min(0, "El saldo no puede ser negativo"),
    incomeSourceId: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : v),
      z.string().optional(),
    ),
  })
  .refine((data) => !data.endDate || data.endDate > data.startDate, {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["endDate"],
  })
  .refine((data) => data.remainingBalance <= data.totalAmount, {
    message: "El saldo restante no puede ser mayor al monto total",
    path: ["remainingBalance"],
  });

/** Estimate end date from remaining balance, payment amount and frequency */
export function estimateEndDate(startDate: Date, remainingBalance: number, paymentAmount: number, paymentFrequency: string): Date {
  const periodsPerYearMap: Record<string, number> = { DAILY: 360, WEEKLY: 52, BIWEEKLY: 24, MONTHLY: 12 };
  const periods = Math.ceil(remainingBalance / paymentAmount);
  const ppy = periodsPerYearMap[paymentFrequency] ?? 12;
  const years = periods / ppy;
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + Math.ceil(years * 12));
  return end;
}

export type LoanInput = z.infer<typeof loanSchema>;
