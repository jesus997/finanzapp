"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-utils";
import { recurringExpenseSchema } from "@/lib/validations/recurring-expense";
import { validatePaymentMethod } from "@/lib/actions/validate-payment-method";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

  await prisma.recurringExpense.create({
    data: { ...parsed.data, userId },
  });

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

  await prisma.recurringExpense.update({
    where: { id, userId },
    data: parsed.data,
  });

  revalidatePath("/gastos");
  redirect("/gastos");
}

export async function deleteRecurringExpense(id: string) {
  const userId = await getAuthUserId();
  await prisma.recurringExpense.deleteMany({ where: { id, userId } });
  revalidatePath("/gastos");
}
