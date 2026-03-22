"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { loanSchema, estimateEndDate } from "@/lib/validations/loan";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  return session.user.id;
}

export async function getLoans() {
  const userId = await getAuthUserId();
  return prisma.loan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLoan(id: string) {
  const userId = await getAuthUserId();
  return prisma.loan.findFirst({ where: { id, userId } });
}

export async function createLoan(formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = loanSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  const { endDate, ...rest } = parsed.data;
  const computedEndDate = endDate ?? estimateEndDate(rest.startDate, rest.remainingBalance, rest.paymentAmount, rest.paymentFrequency);

  await prisma.loan.create({
    data: { ...rest, endDate: computedEndDate, userId },
  });

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

  const { endDate, ...rest } = parsed.data;
  const computedEndDate = endDate ?? estimateEndDate(rest.startDate, rest.remainingBalance, rest.paymentAmount, rest.paymentFrequency);

  await prisma.loan.update({
    where: { id, userId },
    data: { ...rest, endDate: computedEndDate },
  });

  revalidatePath("/prestamos");
  redirect("/prestamos");
}

export async function deleteLoan(id: string) {
  const userId = await getAuthUserId();
  await prisma.loan.deleteMany({ where: { id, userId } });
  revalidatePath("/prestamos");
}
