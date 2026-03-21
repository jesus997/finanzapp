"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cardSchema } from "@/lib/validations/card";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  return session.user.id;
}

export async function getCards() {
  const userId = await getAuthUserId();
  return prisma.card.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCard(id: string) {
  const userId = await getAuthUserId();
  return prisma.card.findFirst({ where: { id, userId } });
}

export async function createCard(formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = cardSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  await prisma.card.create({
    data: { ...parsed.data, userId },
  });

  revalidatePath("/tarjetas");
  redirect("/tarjetas");
}

export async function updateCard(id: string, formData: FormData) {
  const userId = await getAuthUserId();
  const raw = Object.fromEntries(formData);
  const parsed = cardSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  await prisma.card.update({
    where: { id, userId },
    data: parsed.data,
  });

  revalidatePath("/tarjetas");
  redirect("/tarjetas");
}

export async function deleteCard(id: string) {
  const userId = await getAuthUserId();
  await prisma.card.deleteMany({ where: { id, userId } });
  revalidatePath("/tarjetas");
}
