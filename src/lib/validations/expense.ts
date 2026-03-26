import { z } from "zod";

export const expenseSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  date: z.string().min(1, "La fecha es obligatoria"),
  category: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum([
      "HOUSING", "UTILITIES", "SUBSCRIPTIONS", "INSURANCE", "TRANSPORTATION",
      "FOOD", "EDUCATION", "HEALTH", "ENTERTAINMENT", "PERSONAL",
      "PETS", "DONATIONS", "OTHER",
    ]).optional(),
  ),
  paymentMethodType: z.enum(["CREDIT_CARD", "DEBIT_CARD", "INCOME_SOURCE"]),
  paymentMethodId: z.string().min(1, "Selecciona un método de pago"),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
