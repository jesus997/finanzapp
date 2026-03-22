import { describe, it, expect } from "vitest";
import { recurringExpenseSchema } from "./recurring-expense";

const valid = {
  name: "Netflix",
  amount: "299",
  frequency: "MONTHLY",
  payDay: "15",
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
    expect(recurringExpenseSchema.safeParse({ ...valid, frequency: "INVALID" }).success).toBe(false);
  });

  it("accepts DAILY frequency", () => {
    expect(recurringExpenseSchema.safeParse({ ...valid, frequency: "DAILY", payDay: "" }).success).toBe(true);
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

  it("requires 2 payDay values for BIWEEKLY", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, frequency: "BIWEEKLY", payDay: "1,16" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.payDay).toEqual([1, 16]);
  });

  it("rejects BIWEEKLY with only 1 payDay", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, frequency: "BIWEEKLY", payDay: "1" });
    expect(result.success).toBe(false);
  });

  it("requires 1 payDay for MONTHLY", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, frequency: "MONTHLY", payDay: "15" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.payDay).toEqual([15]);
  });

  it("allows empty payDay for WEEKLY", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, frequency: "WEEKLY", payDay: "" });
    expect(result.success).toBe(true);
  });
});
