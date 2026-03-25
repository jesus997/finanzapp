import { z } from "zod";

const baseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  bank: z.string().min(1, "El banco es requerido"),
  lastFourDigits: z.string().length(4, "Debe tener 4 dígitos").regex(/^\d{4}$/, "Solo dígitos"),
  type: z.enum(["CREDIT", "DEBIT"]),
  network: z.enum(["VISA", "MASTERCARD", "AMEX", "OTHER"]),
});

const creditFields = z.object({
  creditLimit: z.coerce.number().positive("El límite debe ser mayor a 0"),
  cutOffDay: z.coerce.number().int().min(1).max(31),
  paymentDay: z.coerce.number().int().min(1).max(31),
  interestRate: z.coerce.number().min(0).default(0),
  currentBalance: z.coerce.number().min(0).optional(),
  monthlyPayment: z.coerce.number().min(0).optional(),
});

export const cardSchema = baseSchema
  .and(
    z.union([
      z.object({ type: z.literal("CREDIT") }).and(creditFields),
      z.object({
        type: z.literal("DEBIT"),
        creditLimit: z.coerce.number().optional(),
        cutOffDay: z.coerce.number().optional(),
        paymentDay: z.coerce.number().optional(),
        interestRate: z.coerce.number().optional(),
        currentBalance: z.coerce.number().optional(),
        monthlyPayment: z.coerce.number().optional(),
      }),
    ])
  )
  .transform((data) => {
    if (data.type === "DEBIT") {
      return {
        name: data.name,
        bank: data.bank,
        lastFourDigits: data.lastFourDigits,
        type: data.type,
        network: data.network,
        creditLimit: null,
        cutOffDay: null,
        paymentDay: null,
        interestRate: null,
        currentBalance: null,
        monthlyPayment: null,
      };
    }
    return {
      name: data.name,
      bank: data.bank,
      lastFourDigits: data.lastFourDigits,
      type: data.type,
      network: data.network,
      creditLimit: data.creditLimit,
      cutOffDay: data.cutOffDay,
      paymentDay: data.paymentDay,
      interestRate: data.interestRate,
      currentBalance: data.currentBalance ?? null,
      monthlyPayment: data.monthlyPayment ?? null,
    };
  });

export type CardInput = z.infer<typeof cardSchema>;
