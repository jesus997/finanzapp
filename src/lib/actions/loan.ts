"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-utils";
import { loanSchema, estimateEndDate } from "@/lib/validations/loan";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { invalidateUserCache } from "@/lib/data/invalidate";

export async function getLoans() {
  const userId = await getAuthUserId();
  return prisma.loan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { incomeSource: { select: { name: true } } },
  });
}

export async function getLoan(id: string) {
  const userId = await getAuthUserId();
  return prisma.loan.findFirst({ where: { id, userId } });
}

export async function getLoanIncomeSourceOptions() {
  const userId = await getAuthUserId();
  return prisma.incomeSource.findMany({
    where: { userId, active: true },
    select: { id: true, name: true },
  });
}

export async function createLoan(formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = loanSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  const { endDate, incomeSourceId, ...rest } = parsed.data;
  const computedEndDate = endDate ?? estimateEndDate(rest.startDate, rest.remainingBalance, rest.paymentAmount, rest.paymentFrequency);

  await prisma.loan.create({
    data: { ...rest, endDate: computedEndDate, incomeSourceId: incomeSourceId ?? null, userId },
  });

  invalidateUserCache(userId);
  revalidatePath("/prestamos");
  redirect("/prestamos");
}

export async function updateLoan(id: string, formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = loanSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  const { endDate, incomeSourceId, ...rest } = parsed.data;
  const computedEndDate = endDate ?? estimateEndDate(rest.startDate, rest.remainingBalance, rest.paymentAmount, rest.paymentFrequency);

  await prisma.loan.update({
    where: { id, userId },
    data: { ...rest, endDate: computedEndDate, incomeSourceId: incomeSourceId ?? null },
  });

  invalidateUserCache(userId);
  revalidatePath("/prestamos");
  redirect("/prestamos");
}

export async function deleteLoan(id: string) {
  const userId = await getAuthUserId();
  await prisma.loan.deleteMany({ where: { id, userId } });
  invalidateUserCache(userId);
  revalidatePath("/prestamos");
}
