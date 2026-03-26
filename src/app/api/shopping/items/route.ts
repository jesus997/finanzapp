import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { shoppingItemSchema } from "@/lib/validations/shopping";

async function getAuthUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function recalcTotal(sessionId: string) {
  const items = await prisma.shoppingItem.findMany({ where: { shoppingSessionId: sessionId } });
  const total = items.reduce((s, i) => s + Number(i.estimatedPrice) * i.quantity, 0);
  await prisma.shoppingSession.update({ where: { id: sessionId }, data: { estimatedTotal: total } });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { sessionId, ...data } = body;

  const session = await prisma.shoppingSession.findFirst({ where: { id: sessionId, userId } });
  if (!session || session.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Sesión no válida" }, { status: 400 });
  }

  const parsed = shoppingItemSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const item = await prisma.shoppingItem.create({
    data: {
      shoppingSessionId: sessionId,
      productId: data.productId ?? null,
      name: parsed.data.name,
      barcode: data.barcode ?? null,
      estimatedPrice: parsed.data.estimatedPrice,
      quantity: parsed.data.quantity,
      notes: parsed.data.notes ?? null,
    },
  });

  await recalcTotal(sessionId);
  return NextResponse.json({ id: item.id });
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { itemId, ...data } = await req.json();
  const item = await prisma.shoppingItem.findUnique({
    where: { id: itemId },
    include: { session: { select: { userId: true, id: true, status: true } } },
  });
  if (!item || item.session.userId !== userId || item.session.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.shoppingItem.update({
    where: { id: itemId },
    data: {
      estimatedPrice: data.estimatedPrice ?? undefined,
      quantity: data.quantity ?? undefined,
      notes: data.notes ?? undefined,
    },
  });

  await recalcTotal(item.session.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { itemId } = await req.json();
  const item = await prisma.shoppingItem.findUnique({
    where: { id: itemId },
    include: { session: { select: { userId: true, id: true, status: true } } },
  });
  if (!item || item.session.userId !== userId || item.session.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.shoppingItem.delete({ where: { id: itemId } });
  await recalcTotal(item.session.id);
  return NextResponse.json({ ok: true });
}
