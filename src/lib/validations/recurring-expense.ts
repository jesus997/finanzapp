import { z } from "zod";

/** Frequencies that use payDay to specify days of the month */
export const EXPENSE_FREQUENCIES_WITH_PAYDAY = new Set(["BIWEEKLY", "MONTHLY"]);

/** How many payDay values each frequency expects */
export const EXPECTED_PAYDAY_COUNT: Record<string, number> = {
  MONTHLY: 1,
  BIWEEKLY: 2,
};

export const recurringExpenseSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional(),
    amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
    frequency: z.enum([
      "ONE_TIME", "DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY",
      "BIMONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL",
    ]),
    payDay: z.preprocess(
      (v) => {
        if (Array.isArray(v)) return v.map(Number);
        if (typeof v === "string" && v !== "") return v.split(",").map(Number);
        return [];
      },
      z.array(z.number().int().min(1).max(31)).default([]),
    ),
    startDate: z.coerce.date({ error: "La fecha de inicio es requerida" }),
    endDate: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
    paymentMethodType: z.enum(["CREDIT_CARD", "DEBIT_CARD", "INCOME_SOURCE"]),
    paymentMethodId: z.string().min(1, "El método de pago es requerido"),
    incomeSourceId: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : v),
      z.string().optional(),
    ),
    category: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum([
        "HOUSING", "UTILITIES", "SUBSCRIPTIONS", "INSURANCE", "TRANSPORTATION",
        "FOOD", "EDUCATION", "HEALTH", "ENTERTAINMENT", "PERSONAL",
        "PETS", "DONATIONS", "OTHER",
      ]).optional(),
    ),
  })
  .refine(
    (data) => {
      const expected = EXPECTED_PAYDAY_COUNT[data.frequency];
      if (!expected) return true;
      return data.payDay.length === expected;
    },
    {
      message: "Debes especificar los días de cobro para esta frecuencia",
      path: ["payDay"],
    },
  );

export type RecurringExpenseInput = z.infer<typeof recurringExpenseSchema>;
