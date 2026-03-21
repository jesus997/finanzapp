import { z } from "zod";
import { FREQUENCIES_REQUIRING_MONTH } from "@/lib/constants";

const dayOfMonth = z.coerce.number().int().min(1).max(31);
const dayOfWeek = z.coerce.number().int().min(0).max(6);
const monthValue = z.coerce.number().int().min(1).max(12);

const toArray = (v: number | number[]) => (Array.isArray(v) ? v : [v]);

export const incomeSourceSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    type: z.enum([
      "SALARY", "BONUS", "CHRISTMAS_BONUS", "PROFIT_SHARING",
      "SAVINGS_FUND", "PASSIVE", "ACTIVE", "WINDFALL", "OTHER",
    ]),
    amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
    frequency: z.enum([
      "ONE_TIME", "WEEKLY", "BIWEEKLY", "MONTHLY",
      "BIMONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL",
    ]),
    payDayType: z.enum(["DAY_OF_MONTH", "DAY_OF_WEEK"]),
    payDay: z
      .union([z.coerce.number().int(), z.array(z.coerce.number().int())])
      .transform(toArray)
      .optional()
      .default([]),
    payMonth: z
      .union([z.coerce.number().int(), z.array(z.coerce.number().int())])
      .transform(toArray)
      .optional()
      .default([]),
    isVariable: z.coerce.boolean().default(false),
    oneTimeDate: z.coerce.date().optional(),
    active: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.frequency === "ONE_TIME") return true;
      if (data.payDay.length === 0) return false;
      const validator = data.payDayType === "DAY_OF_MONTH" ? dayOfMonth : dayOfWeek;
      return data.payDay.every((d) => validator.safeParse(d).success);
    },
    { message: "Día de pago inválido", path: ["payDay"] }
  )
  .refine(
    (data) => {
      if (data.frequency === "ONE_TIME") return true;
      if (!FREQUENCIES_REQUIRING_MONTH.has(data.frequency)) return true;
      return data.payMonth.length > 0 && data.payMonth.every((m) => monthValue.safeParse(m).success);
    },
    { message: "Mes de pago requerido para esta frecuencia", path: ["payMonth"] }
  )
  .refine(
    (data) => {
      if (data.frequency !== "ONE_TIME") return true;
      return data.oneTimeDate !== undefined;
    },
    { message: "La fecha es requerida para ingresos únicos", path: ["oneTimeDate"] }
  );

export type IncomeSourceInput = z.infer<typeof incomeSourceSchema>;
