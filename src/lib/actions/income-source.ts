"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-utils";
import { incomeSourceSchema } from "@/lib/validations/income-source";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getIncomeSources() {
  const userId = await getAuthUserId();
  return prisma.incomeSource.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { depositCard: { select: { name: true, lastFourDigits: true } } },
  });
}

export async function getDebitCards() {
  const userId = await getAuthUserId();
  return prisma.card.findMany({
    where: { userId, type: "DEBIT" },
    select: { id: true, name: true, lastFourDigits: true },
  });
}

export async function getIncomeSource(id: string) {
  const userId = await getAuthUserId();
  return prisma.incomeSource.findFirst({ where: { id, userId } });
}

export async function createIncomeSource(formData: FormData) {
  const userId = await getAuthUserId();
  const raw = {
    ...Object.fromEntries(formData),
    payDay: formData.getAll("payDay").map(Number),
    payMonth: formData.getAll("payMonth").map(Number),
  };
  const parsed = incomeSourceSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  await prisma.incomeSource.create({
    data: { ...parsed.data, userId },
  });

  revalidatePath("/ingresos");
  redirect("/ingresos");
}

export async function updateIncomeSource(id: string, formData: FormData) {
  const userId = await getAuthUserId();
  const raw = {
    ...Object.fromEntries(formData),
    payDay: formData.getAll("payDay").map(Number),
    payMonth: formData.getAll("payMonth").map(Number),
  };
  const parsed = incomeSourceSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  await prisma.incomeSource.update({
    where: { id, userId },
    data: parsed.data,
  });

  revalidatePath("/ingresos");
  redirect("/ingresos");
}

export async function deleteIncomeSource(id: string) {
  const userId = await getAuthUserId();
  await prisma.incomeSource.deleteMany({ where: { id, userId } });
  revalidatePath("/ingresos");
}
