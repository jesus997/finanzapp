import { z } from "zod";

export const loanSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    type: z.enum(["BANK", "PAYROLL", "AUTO", "INFONAVIT", "MORTGAGE", "OTHER"]),
    institution: z.string().min(1, "La institución es requerida"),
    totalAmount: z.coerce.number().positive("El monto total debe ser mayor a 0"),
    monthlyPayment: z.coerce.number().positive("El pago mensual debe ser mayor a 0"),
    interestRate: z.coerce.number().min(0, "La tasa no puede ser negativa").default(0),
    startDate: z.coerce.date({ error: "La fecha de inicio es requerida" }),
    endDate: z.coerce.date({ error: "La fecha de fin es requerida" }),
    paymentDay: z.coerce.number().int().min(1).max(31, "Día de pago entre 1 y 31"),
    remainingBalance: z.coerce.number().min(0, "El saldo no puede ser negativo"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["endDate"],
  })
  .refine((data) => data.remainingBalance <= data.totalAmount, {
    message: "El saldo restante no puede ser mayor al monto total",
    path: ["remainingBalance"],
  });

export type LoanInput = z.infer<typeof loanSchema>;
