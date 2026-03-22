"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { savingsFundSchema } from "@/lib/validations/savings-fund";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  return session.user.id;
}

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
    select: { id: true, name: true },
  });
}

export async function createSavingsFund(formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = savingsFundSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  await prisma.savingsFund.create({
    data: { ...parsed.data, userId },
  });

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

  await prisma.savingsFund.update({
    where: { id, userId },
    data: parsed.data,
  });

  revalidatePath("/ahorro");
  redirect("/ahorro");
}

export async function deleteSavingsFund(id: string) {
  const userId = await getAuthUserId();
  await prisma.savingsFund.deleteMany({ where: { id, userId } });
  revalidatePath("/ahorro");
}
