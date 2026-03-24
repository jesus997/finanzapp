import { z } from "zod";

export const shoppingSessionSchema = z.object({
  storeId: z.string().min(1, "La tienda es requerida"),
  name: z.string().min(1, "El nombre es requerido"),
  paymentMethodType: z.enum(["CREDIT_CARD", "DEBIT_CARD", "INCOME_SOURCE"]).optional(),
  paymentMethodId: z.string().optional(),
});

export type ShoppingSessionInput = z.infer<typeof shoppingSessionSchema>;

export const shoppingItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  barcode: z.string().optional(),
  estimatedPrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  quantity: z.coerce.number().int().min(1, "La cantidad mínima es 1").default(1),
  notes: z.string().optional(),
});

export type ShoppingItemInput = z.infer<typeof shoppingItemSchema>;

export const storeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export type StoreInput = z.infer<typeof storeSchema>;
