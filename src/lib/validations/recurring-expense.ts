import { z } from "zod";

export const recurringExpenseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  frequency: z.enum([
    "ONE_TIME", "WEEKLY", "BIWEEKLY", "MONTHLY",
    "BIMONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL",
  ]),
  startDate: z.coerce.date({ required_error: "La fecha de inicio es requerida" }),
  endDate: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
  paymentMethodType: z.enum(["CREDIT_CARD", "DEBIT_CARD", "INCOME_SOURCE"]),
  paymentMethodId: z.string().min(1, "El método de pago es requerido"),
  category: z.string().optional(),
});

export type RecurringExpenseInput = z.infer<typeof recurringExpenseSchema>;
