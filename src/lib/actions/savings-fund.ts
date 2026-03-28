"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-utils";
import { savingsFundSchema } from "@/lib/validations/savings-fund";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { invalidateUserCache } from "@/lib/data/invalidate";

export async function getSavingsFunds() {
  const userId = await getAuthUserId();
  return prisma.savingsFund.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { incomeSource: { select: { name: true } } },
  });
}

export async function getSavingsFund(id: string) {
  const userId = await getAuthUserId();
  return prisma.savingsFund.findFirst({ where: { id, userId } });
}

export async function getIncomeSourceOptions() {
  const userId = await getAuthUserId();
  return prisma.incomeSource.findMany({
    where: { userId, active: true },
    select: { id: true, name: true, amount: true, frequency: true },
  });
}

export async function createSavingsFund(formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = savingsFundSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  const { targetAmount, targetDate, ...rest } = parsed.data;

  await prisma.savingsFund.create({
    data: {
      ...rest,
      targetAmount: targetAmount ?? null,
      targetDate: targetDate ?? null,
      userId,
    },
  });

  invalidateUserCache(userId);
  revalidatePath("/ahorro");
  redirect("/ahorro");
}

export async function updateSavingsFund(id: string, formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = savingsFundSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  const { targetAmount, targetDate, ...rest } = parsed.data;

  await prisma.savingsFund.update({
    where: { id, userId },
    data: {
      ...rest,
      targetAmount: targetAmount ?? null,
      targetDate: targetDate ?? null,
    },
  });

  invalidateUserCache(userId);
  revalidatePath("/ahorro");
  redirect("/ahorro");
}

export async function deleteSavingsFund(id: string) {
  const userId = await getAuthUserId();
  await prisma.savingsFund.deleteMany({ where: { id, userId } });
  invalidateUserCache(userId);
  revalidatePath("/ahorro");
}

export async function withdrawFromSavingsFund(id: string, formData: FormData) {
  const userId = await getAuthUserId();
  const amount = parseFloat(formData.get("amount") as string);
  const note = (formData.get("note") as string) || null;

  if (!amount || amount <= 0) throw new Error("El monto debe ser mayor a 0");

  const fund = await prisma.savingsFund.findFirst({ where: { id, userId } });
  if (!fund) throw new Error("Fondo no encontrado");
  if (amount > Number(fund.accumulatedBalance)) throw new Error("Saldo insuficiente");

  await prisma.$transaction(async (tx) => {
    const updated = await tx.savingsFund.update({
      where: { id },
      data: { accumulatedBalance: { decrement: amount } },
    });
    await tx.savingsMovement.create({
      data: { savingsFundId: id, type: "WITHDRAWAL", amount, note },
    });
    // Reopen if balance dropped below target
    if (updated.completedAt && updated.targetAmount && Number(updated.accumulatedBalance) < Number(updated.targetAmount)) {
      await tx.savingsFund.update({
        where: { id },
        data: { completedAt: null },
      });
    }
  });

  invalidateUserCache(userId);
  revalidatePath("/ahorro");
}

export async function getSavingsFundMovements(fundId: string) {
  const userId = await getAuthUserId();
  const fund = await prisma.savingsFund.findFirst({ where: { id: fundId, userId }, select: { id: true } });
  if (!fund) return [];

  const movements = await prisma.savingsMovement.findMany({
    where: { savingsFundId: fundId },
    orderBy: { createdAt: "desc" },
    include: { distribution: { select: { incomeSource: { select: { name: true } } } } },
  });

  return movements.map((m) => ({
    id: m.id,
    type: m.type,
    amount: Number(m.amount),
    note: m.note,
    sourceName: m.distribution?.incomeSource?.name ?? null,
    createdAt: m.createdAt,
  }));
}
