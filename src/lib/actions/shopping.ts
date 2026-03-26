"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shoppingItemSchema, storeSchema } from "@/lib/validations/shopping";
import { validatePaymentMethod } from "@/lib/actions/validate-payment-method";

// ── Stores ──────────────────────────────────────────────────

export async function getStores() {
  return prisma.store.findMany({ orderBy: { name: "asc" } });
}

export async function createStore(formData: FormData) {
  const parsed = storeSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await prisma.store.create({
    data: {
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
    },
  });
  revalidatePath("/compras");
}

// ── Sessions ────────────────────────────────────────────────

export async function getShoppingSessions() {
  const userId = await getAuthUserId();
  const sessions = await prisma.shoppingSession.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { store: { select: { name: true } }, _count: { select: { items: true } } },
  });
  return sessions.map((s) => ({
    id: s.id,
    name: s.name,
    storeName: s.store.name,
    status: s.status,
    estimatedTotal: Number(s.estimatedTotal),
    finalTotal: s.finalTotal ? Number(s.finalTotal) : null,
    itemCount: s._count.items,
    date: s.date,
  }));
}

export async function getShoppingSession(id: string) {
  const userId = await getAuthUserId();
  const session = await prisma.shoppingSession.findFirst({
    where: { id, userId },
    include: {
      store: true,
      items: { orderBy: { createdAt: "asc" }, include: { product: true } },
    },
  });
  if (!session) return null;

  return {
    id: session.id,
    name: session.name,
    storeId: session.storeId,
    storeName: session.store.name,
    status: session.status,
    paymentMethodType: session.paymentMethodType,
    paymentMethodId: session.paymentMethodId,
    estimatedTotal: Number(session.estimatedTotal),
    finalTotal: session.finalTotal ? Number(session.finalTotal) : null,
    expenseId: session.expenseId,
    date: session.date,
    items: session.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.name,
      barcode: i.barcode,
      estimatedPrice: Number(i.estimatedPrice),
      finalPrice: i.finalPrice ? Number(i.finalPrice) : null,
      quantity: i.quantity,
      notes: i.notes,
    })),
  };
}

export async function createShoppingSession(formData: FormData) {
  const userId = await getAuthUserId();
  const storeId = formData.get("storeId") as string;
  if (!storeId) throw new Error("La tienda es requerida");

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Tienda no encontrada");

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  const name = `${store.name} ${dateStr}`;

  const session = await prisma.shoppingSession.create({
    data: { userId, storeId, name, date: now },
  });

  redirect(`/compras/${session.id}`);
}

// ── Items ───────────────────────────────────────────────────

export async function addShoppingItem(
  sessionId: string,
  data: { name: string; barcode?: string; estimatedPrice: number; quantity?: number; notes?: string; productId?: string },
) {
  const userId = await getAuthUserId();
  const session = await prisma.shoppingSession.findFirst({ where: { id: sessionId, userId } });
  if (!session || session.status !== "IN_PROGRESS") throw new Error("Sesión no válida");

  const parsed = shoppingItemSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await prisma.shoppingItem.create({
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

  // Update estimated total
  const agg = await prisma.shoppingItem.aggregate({
    where: { shoppingSessionId: sessionId },
    _sum: { estimatedPrice: true },
  });
  // Simple sum — for weighted total we'd need quantity * price, but aggregate doesn't support expressions
  const items = await prisma.shoppingItem.findMany({ where: { shoppingSessionId: sessionId } });
  const total = items.reduce((s, i) => s + Number(i.estimatedPrice) * i.quantity, 0);

  await prisma.shoppingSession.update({
    where: { id: sessionId },
    data: { estimatedTotal: total },
  });
}

export async function updateShoppingItem(
  itemId: string,
  data: { estimatedPrice?: number; quantity?: number; notes?: string },
) {
  const userId = await getAuthUserId();
  const item = await prisma.shoppingItem.findUnique({
    where: { id: itemId },
    include: { session: { select: { userId: true, id: true, status: true } } },
  });
  if (!item || item.session.userId !== userId || item.session.status !== "IN_PROGRESS") {
    throw new Error("No autorizado");
  }

  await prisma.shoppingItem.update({
    where: { id: itemId },
    data: {
      estimatedPrice: data.estimatedPrice ?? undefined,
      quantity: data.quantity ?? undefined,
      notes: data.notes ?? undefined,
    },
  });

  // Recalculate total
  const items = await prisma.shoppingItem.findMany({ where: { shoppingSessionId: item.session.id } });
  const total = items.reduce((s, i) => s + Number(i.estimatedPrice) * i.quantity, 0);
  await prisma.shoppingSession.update({
    where: { id: item.session.id },
    data: { estimatedTotal: total },
  });
}

export async function removeShoppingItem(itemId: string) {
  const userId = await getAuthUserId();
  const item = await prisma.shoppingItem.findUnique({
    where: { id: itemId },
    include: { session: { select: { userId: true, id: true, status: true } } },
  });
  if (!item || item.session.userId !== userId || item.session.status !== "IN_PROGRESS") {
    throw new Error("No autorizado");
  }

  await prisma.shoppingItem.delete({ where: { id: itemId } });

  const items = await prisma.shoppingItem.findMany({ where: { shoppingSessionId: item.session.id } });
  const total = items.reduce((s, i) => s + Number(i.estimatedPrice) * i.quantity, 0);
  await prisma.shoppingSession.update({
    where: { id: item.session.id },
    data: { estimatedTotal: total },
  });
}

// ── Product lookup ──────────────────────────────────────────

export async function lookupProduct(barcode: string, storeId: string) {
  // 1. Local DB
  const product = await prisma.product.findUnique({
    where: { barcode },
    include: { prices: { where: { storeId } } },
  });
  if (product) {
    return {
      found: true as const,
      source: "local" as const,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.prices[0] ? Number(product.prices[0].price) : null,
    };
  }

  // 2. Open Food Facts
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.status === 1 && json.product) {
        const p = json.product;
        const name = p.product_name || p.product_name_es || barcode;
        const brand = p.brands || null;
        // Create global product
        const created = await prisma.product.create({
          data: { barcode, name, brand, source: "OPEN_FOOD_FACTS" },
        });
        return {
          found: true as const,
          source: "openfoodfacts" as const,
          productId: created.id,
          name,
          brand,
          description: null,
          price: null,
        };
      }
    }
  } catch {
    // API unavailable — fall through to manual
  }

  // 3. Not found
  return { found: false as const };
}

// ── Complete session ────────────────────────────────────────

export async function completeShoppingSession(
  sessionId: string,
  data: {
    paymentMethodType: string;
    paymentMethodId: string;
    finalItems: { itemId: string; finalPrice: number }[];
  },
) {
  const userId = await getAuthUserId();
  const session = await prisma.shoppingSession.findFirst({
    where: { id: sessionId, userId, status: "IN_PROGRESS" },
    include: { items: true, store: true },
  });
  if (!session) throw new Error("Sesión no encontrada");

  await validatePaymentMethod(userId, data.paymentMethodType, data.paymentMethodId);

  const finalTotal = data.finalItems.reduce((s, i) => s + i.finalPrice, 0);
  const round2 = (n: number) => Math.round(n * 100) / 100;

  await prisma.$transaction(async (tx) => {
    // Update final prices on items
    for (const fi of data.finalItems) {
      const item = session.items.find((i) => i.id === fi.itemId);
      if (!item) continue;

      await tx.shoppingItem.update({
        where: { id: fi.itemId },
        data: { finalPrice: fi.finalPrice },
      });

      // Update ProductPrice for this store
      if (item.productId) {
        await tx.productPrice.upsert({
          where: { productId_storeId: { productId: item.productId, storeId: session.storeId } },
          update: { price: fi.finalPrice / (item.quantity || 1) },
          create: {
            productId: item.productId,
            storeId: session.storeId,
            price: fi.finalPrice / (item.quantity || 1),
          },
        });
      }
    }

    // Create Expense
    const expense = await tx.expense.create({
      data: {
        userId,
        name: session.name,
        amount: round2(finalTotal),
        date: session.date,
        category: "FOOD",
        paymentMethodType: data.paymentMethodType as "CREDIT_CARD" | "DEBIT_CARD" | "INCOME_SOURCE",
        paymentMethodId: data.paymentMethodId,
      },
    });

    // Mark session completed
    await tx.shoppingSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        finalTotal: round2(finalTotal),
        paymentMethodType: data.paymentMethodType as "CREDIT_CARD" | "DEBIT_CARD" | "INCOME_SOURCE",
        paymentMethodId: data.paymentMethodId,
        expenseId: expense.id,
      },
    });
  });

  revalidatePath("/compras");
  revalidatePath("/gastos-diarios");
  revalidatePath("/");
  redirect("/compras");
}

export async function deleteShoppingSession(id: string) {
  const userId = await getAuthUserId();
  await prisma.shoppingSession.deleteMany({ where: { id, userId } });
  revalidatePath("/compras");
}
