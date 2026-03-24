import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const barcode = req.nextUrl.searchParams.get("barcode");
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!barcode || !storeId) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  // 1. Local DB
  const product = await prisma.product.findUnique({
    where: { barcode },
    include: { prices: { where: { storeId } } },
  });
  if (product) {
    return NextResponse.json({
      found: true,
      source: "local",
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.prices[0] ? Number(product.prices[0].price) : null,
    });
  }

  // 2. Open Food Facts
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 1 && json.product) {
        const p = json.product;
        const name = p.product_name || p.product_name_es || barcode;
        const brand = p.brands || null;
        const created = await prisma.product.create({
          data: { barcode, name, brand, source: "OPEN_FOOD_FACTS" },
        });
        return NextResponse.json({
          found: true,
          source: "openfoodfacts",
          productId: created.id,
          name,
          brand,
          price: null,
        });
      }
    }
  } catch {
    // API unavailable — fall through
  }

  // 3. Not found
  return NextResponse.json({ found: false });
}
