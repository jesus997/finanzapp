import { describe, it, expect } from "vitest";
import { recurringExpenseSchema } from "./recurring-expense";

const valid = {
  name: "Netflix",
  amount: "299",
  frequency: "MONTHLY",
  startDate: "2025-01-01",
  paymentMethodType: "CREDIT_CARD",
  paymentMethodId: "card-123",
  category: "SUBSCRIPTIONS",
};

describe("recurringExpenseSchema", () => {
  it("accepts valid data", () => {
    expect(recurringExpenseSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(recurringExpenseSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects zero amount", () => {
    expect(recurringExpenseSchema.safeParse({ ...valid, amount: "0" }).success).toBe(false);
  });

  it("rejects invalid frequency", () => {
    expect(recurringExpenseSchema.safeParse({ ...valid, frequency: "DAILY" }).success).toBe(false);
  });

  it("rejects empty paymentMethodId", () => {
    expect(recurringExpenseSchema.safeParse({ ...valid, paymentMethodId: "" }).success).toBe(false);
  });

  it("rejects invalid paymentMethodType", () => {
    expect(recurringExpenseSchema.safeParse({ ...valid, paymentMethodType: "CASH" }).success).toBe(false);
  });

  it("accepts without optional fields", () => {
    const { description, endDate, category, ...required } = valid;
    expect(recurringExpenseSchema.safeParse(required).success).toBe(true);
  });

  it("accepts with endDate", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, endDate: "2026-12-31" });
    expect(result.success).toBe(true);
  });

  it("coerces string values", () => {
    const result = recurringExpenseSchema.safeParse(valid);
    if (result.success) {
      expect(typeof result.data.amount).toBe("number");
      expect(result.data.startDate).toBeInstanceOf(Date);
    }
  });
});
