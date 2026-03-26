"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-utils";
import { expenseSchema } from "@/lib/validations/expense";
import { validatePaymentMethod } from "@/lib/actions/validate-payment-method";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getExpenses() {
  const userId = await getAuthUserId();
  return prisma.expense.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function getExpense(id: string) {
  const userId = await getAuthUserId();
  return prisma.expense.findFirst({ where: { id, userId } });
}

export async function createExpense(formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = expenseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  const { date, ...rest } = parsed.data;
  await validatePaymentMethod(userId, rest.paymentMethodType, rest.paymentMethodId);

  await prisma.expense.create({
    data: { ...rest, date: new Date(date), userId },
  });

  revalidatePath("/gastos-diarios");
  redirect("/gastos-diarios");
}

export async function updateExpense(id: string, formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = expenseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  const { date, ...rest } = parsed.data;
  await validatePaymentMethod(userId, rest.paymentMethodType, rest.paymentMethodId);

  await prisma.expense.update({
    where: { id, userId },
    data: { ...rest, date: new Date(date) },
  });

  revalidatePath("/gastos-diarios");
  redirect("/gastos-diarios");
}

export async function deleteExpense(id: string) {
  const userId = await getAuthUserId();
  await prisma.expense.deleteMany({ where: { id, userId } });
  revalidatePath("/gastos-diarios");
}

/** Sum of expenses in a given month */
export async function getMonthlyExpensesTotal(year: number, month: number): Promise<number> {
  const userId = await getAuthUserId();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const result = await prisma.expense.aggregate({
    where: { userId, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}
