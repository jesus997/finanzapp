import { describe, it, expect } from "vitest";
import { shoppingSessionSchema, shoppingItemSchema, storeSchema, productSchema } from "./shopping";

describe("shoppingSessionSchema", () => {
  it("accepts valid session", () => {
    const result = shoppingSessionSchema.safeParse({
      storeId: "store-1",
      name: "Walmart 23 mar",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty storeId", () => {
    const result = shoppingSessionSchema.safeParse({ storeId: "", name: "Test" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = shoppingSessionSchema.safeParse({ storeId: "s1", name: "" });
    expect(result.success).toBe(false);
  });

  it("accepts optional payment method", () => {
    const result = shoppingSessionSchema.safeParse({
      storeId: "s1",
      name: "Test",
      paymentMethodType: "CREDIT_CARD",
      paymentMethodId: "card-1",
    });
    expect(result.success).toBe(true);
  });
});

describe("shoppingItemSchema", () => {
  it("accepts valid item", () => {
    const result = shoppingItemSchema.safeParse({
      name: "Coca-Cola 600ml",
      estimatedPrice: 18.5,
      quantity: 2,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(2);
    }
  });

  it("defaults quantity to 1", () => {
    const result = shoppingItemSchema.safeParse({
      name: "Pan",
      estimatedPrice: 35,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(1);
    }
  });

  it("rejects negative price", () => {
    const result = shoppingItemSchema.safeParse({
      name: "Test",
      estimatedPrice: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = shoppingItemSchema.safeParse({
      name: "",
      estimatedPrice: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects quantity less than 1", () => {
    const result = shoppingItemSchema.safeParse({
      name: "Test",
      estimatedPrice: 10,
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("storeSchema", () => {
  it("accepts valid store", () => {
    const result = storeSchema.safeParse({ name: "HEB" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = storeSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("accepts store with address and coordinates", () => {
    const result = storeSchema.safeParse({
      name: "Walmart Sendero",
      address: "Av. Sendero Norte 123, Monterrey",
      latitude: 25.7246,
      longitude: -100.3133,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid latitude", () => {
    const result = storeSchema.safeParse({ name: "Test", latitude: 100 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid longitude", () => {
    const result = storeSchema.safeParse({ name: "Test", longitude: 200 });
    expect(result.success).toBe(false);
  });
});

describe("productSchema", () => {
  it("accepts valid product", () => {
    const result = productSchema.safeParse({
      name: "Coca-Cola 600ml",
      barcode: "7501055300120",
    });
    expect(result.success).toBe(true);
  });

  it("accepts product with optional fields", () => {
    const result = productSchema.safeParse({
      name: "Coca-Cola 600ml",
      barcode: "7501055300120",
      brand: "Coca-Cola",
      description: "Refresco de cola 600ml botella PET",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = productSchema.safeParse({ name: "", barcode: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty barcode", () => {
    const result = productSchema.safeParse({ name: "Test", barcode: "" });
    expect(result.success).toBe(false);
  });
});
