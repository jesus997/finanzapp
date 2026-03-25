"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("No autorizado");
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!admins.includes(email.toLowerCase())) throw new Error("No autorizado");
  return email;
}

// ── Stats ───────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalInvitations: number;
  usedInvitations: number;
  totalProducts: number;
  totalStores: number;
  totalShoppingSessions: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();

  const [totalUsers, totalInvitations, usedInvitations, totalProducts, totalStores, totalShoppingSessions] =
    await Promise.all([
      prisma.user.count(),
      prisma.invitation.count(),
      prisma.invitation.count({ where: { usedAt: { not: null } } }),
      prisma.product.count(),
      prisma.store.count(),
      prisma.shoppingSession.count(),
    ]);

  return { totalUsers, totalInvitations, usedInvitations, totalProducts, totalStores, totalShoppingSessions };
}

// ── Users ───────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  invitedByName: string | null;
  invitationsSent: number;
  invitationsUsed: number;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      invitedBy: { select: { name: true } },
      invitations: { select: { usedAt: true } },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    createdAt: u.createdAt.toISOString(),
    invitedByName: u.invitedBy?.name ?? null,
    invitationsSent: u.invitations.length,
    invitationsUsed: u.invitations.filter((i) => i.usedAt).length,
  }));
}

// ── Invitations ─────────────────────────────────────────────

export interface AdminInvitation {
  id: string;
  code: string;
  inviterName: string | null;
  inviterEmail: string | null;
  usedByEmail: string | null;
  usedAt: string | null;
  createdAt: string;
}

export async function getAdminInvitations(): Promise<AdminInvitation[]> {
  await requireAdmin();

  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    include: { inviter: { select: { name: true, email: true } } },
  });

  return invitations.map((i) => ({
    id: i.id,
    code: i.code,
    inviterName: i.inviter.name,
    inviterEmail: i.inviter.email,
    usedByEmail: i.usedByEmail,
    usedAt: i.usedAt?.toISOString() ?? null,
    createdAt: i.createdAt.toISOString(),
  }));
}

// ── Products ────────────────────────────────────────────────

export interface AdminProduct {
  id: string;
  barcode: string;
  name: string;
  brand: string | null;
  description: string | null;
  source: string;
  priceCount: number;
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { prices: true } } },
  });

  return products.map((p) => ({
    id: p.id,
    barcode: p.barcode,
    name: p.name,
    brand: p.brand,
    description: p.description,
    source: p.source,
    priceCount: p._count.prices,
  }));
}

export async function updateProduct(
  id: string,
  data: { name?: string; brand?: string; description?: string },
) {
  await requireAdmin();
  await prisma.product.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      brand: data.brand ?? undefined,
      description: data.description ?? undefined,
    },
  });
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
}
