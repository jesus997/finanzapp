"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

const MAX_INVITATIONS = 10;

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  return session.user.id;
}

export async function getInvitations() {
  const userId = await getAuthUserId();
  return prisma.invitation.findMany({
    where: { inviterId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvitationCount() {
  const userId = await getAuthUserId();
  return prisma.invitation.count({ where: { inviterId: userId } });
}

export async function createInvitation() {
  const userId = await getAuthUserId();

  const count = await prisma.invitation.count({ where: { inviterId: userId } });
  if (count >= MAX_INVITATIONS) throw new Error("Has alcanzado el límite de invitaciones");

  const code = randomBytes(6).toString("hex");
  await prisma.invitation.create({
    data: { code, inviterId: userId },
  });

  revalidatePath("/invitaciones");
}

export async function deleteInvitation(id: string) {
  const userId = await getAuthUserId();
  const invitation = await prisma.invitation.findFirst({ where: { id, inviterId: userId } });
  if (!invitation) throw new Error("Invitación no encontrada");
  if (invitation.usedAt) throw new Error("No se puede eliminar una invitación ya usada");

  await prisma.invitation.deleteMany({ where: { id, inviterId: userId } });
  revalidatePath("/invitaciones");
}

export async function getInvitationByCode(code: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { code },
    include: { inviter: { select: { name: true, image: true } } },
  });
  if (!invitation) return null;
  const maxUses = invitation.maxUses ?? 1;
  const exhausted = invitation.useCount >= maxUses;
  return {
    code: invitation.code,
    used: exhausted,
    inviterName: invitation.inviter.name,
    inviterImage: invitation.inviter.image,
  };
}
