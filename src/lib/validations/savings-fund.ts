import { z } from "zod";

export const savingsFundSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    type: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]),
    value: z.coerce.number().positive("El valor debe ser mayor a 0"),
    incomeSourceId: z.string().min(1, "La fuente de ingreso es requerida"),
    accumulatedBalance: z.coerce.number().min(0).default(0),
  })
  .refine((data) => {
    if (data.type === "PERCENTAGE") return data.value <= 100;
    return true;
  }, {
    message: "El porcentaje no puede ser mayor a 100",
    path: ["value"],
  });

export type SavingsFundInput = z.infer<typeof savingsFundSchema>;
