import { describe, it, expect } from "vitest";
import { expenseSchema } from "./expense";

describe("expenseSchema", () => {
  const valid = {
    name: "Súper",
    amount: 350.5,
    date: "2026-03-22",
    paymentMethodType: "DEBIT_CARD" as const,
    paymentMethodId: "card-1",
  };

  it("accepts valid expense", () => {
    expect(expenseSchema.parse(valid)).toBeDefined();
  });

  it("accepts with optional fields", () => {
    const result = expenseSchema.parse({ ...valid, description: "Despensa semanal", category: "FOOD" });
    expect(result.category).toBe("FOOD");
  });

  it("rejects missing name", () => {
    expect(() => expenseSchema.parse({ ...valid, name: "" })).toThrow();
  });

  it("rejects zero amount", () => {
    expect(() => expenseSchema.parse({ ...valid, amount: 0 })).toThrow();
  });

  it("rejects missing date", () => {
    expect(() => expenseSchema.parse({ ...valid, date: "" })).toThrow();
  });

  it("rejects missing payment method", () => {
    expect(() => expenseSchema.parse({ ...valid, paymentMethodId: "" })).toThrow();
  });
});
