import { prisma } from "@/lib/prisma";

/**
 * Validates that a paymentMethodId exists and belongs to the given user.
 * Throws if the reference is invalid.
 */
export async function validatePaymentMethod(
  userId: string,
  type: string,
  id: string,
): Promise<void> {
  if (type === "CREDIT_CARD" || type === "DEBIT_CARD") {
    const expectedCardType = type === "CREDIT_CARD" ? "CREDIT" : "DEBIT";
    const card = await prisma.card.findFirst({
      where: { id, userId, type: expectedCardType },
      select: { id: true },
    });
    if (!card) throw new Error("Método de pago no válido");
  } else if (type === "INCOME_SOURCE") {
    const source = await prisma.incomeSource.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!source) throw new Error("Método de pago no válido");
  } else {
    throw new Error("Tipo de método de pago no válido");
  }
}
