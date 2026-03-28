"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-utils";
import { recurringExpenseSchema } from "@/lib/validations/recurring-expense";
import { validatePaymentMethod } from "@/lib/actions/validate-payment-method";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { invalidateUserCache } from "@/lib/data/invalidate";

/**
 * Auto-resolve incomeSourceId from payment method:
 * - INCOME_SOURCE → the paymentMethodId IS the income source
 * - DEBIT_CARD → find which income source has this card as depositCard
 * - CREDIT_CARD → cannot infer, use explicit value from form
 */
async function resolveIncomeSourceId(
  userId: string,
  type: string,
  paymentMethodId: string,
  explicit?: string,
): Promise<string | null> {
  if (type === "INCOME_SOURCE") return paymentMethodId;
  if (type === "DEBIT_CARD") {
    const source = await prisma.incomeSource.findFirst({
      where: { userId, depositCardId: paymentMethodId, active: true },
      select: { id: true },
    });
    return source?.id ?? null;
  }
  // CREDIT_CARD: use explicit selection from form
  return explicit ?? null;
}

export async function getRecurringExpenses() {
  const userId = await getAuthUserId();
  return prisma.recurringExpense.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecurringExpense(id: string) {
  const userId = await getAuthUserId();
  return prisma.recurringExpense.findFirst({ where: { id, userId } });
}

export async function getPaymentMethodOptions() {
  const userId = await getAuthUserId();
  const [cards, incomeSources] = await Promise.all([
    prisma.card.findMany({ where: { userId }, select: { id: true, name: true, type: true, lastFourDigits: true } }),
    prisma.incomeSource.findMany({ where: { userId, active: true }, select: { id: true, name: true } }),
  ]);
  return { cards, incomeSources };
}

export async function createRecurringExpense(formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = recurringExpenseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  await validatePaymentMethod(userId, parsed.data.paymentMethodType, parsed.data.paymentMethodId);

  const { incomeSourceId: explicit, ...rest } = parsed.data;
  const resolvedSourceId = await resolveIncomeSourceId(userId, rest.paymentMethodType, rest.paymentMethodId, explicit);

  await prisma.recurringExpense.create({
    data: { ...rest, incomeSourceId: resolvedSourceId, userId },
  });

  invalidateUserCache(userId);
  revalidatePath("/gastos");
  redirect("/gastos");
}

export async function updateRecurringExpense(id: string, formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = recurringExpenseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  await validatePaymentMethod(userId, parsed.data.paymentMethodType, parsed.data.paymentMethodId);

  const { incomeSourceId: explicit2, ...rest2 } = parsed.data;
  const resolvedSourceId = await resolveIncomeSourceId(userId, rest2.paymentMethodType, rest2.paymentMethodId, explicit2);

  await prisma.recurringExpense.update({
    where: { id, userId },
    data: { ...rest2, incomeSourceId: resolvedSourceId },
  });

  invalidateUserCache(userId);
  revalidatePath("/gastos");
  redirect("/gastos");
}

export async function deleteRecurringExpense(id: string) {
  const userId = await getAuthUserId();
  await prisma.recurringExpense.deleteMany({ where: { id, userId } });
  invalidateUserCache(userId);
  revalidatePath("/gastos");
}
