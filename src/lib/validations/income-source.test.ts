import { describe, it, expect } from "vitest";
import { incomeSourceSchema } from "./income-source";

describe("incomeSourceSchema", () => {
  const validMonthly = {
    name: "Salary",
    type: "SALARY",
    amount: 15000,
    frequency: "BIWEEKLY",
    payDayType: "DAY_OF_MONTH",
    payDay: [15, 30],
  };

  const validWeekly = {
    name: "Mercado Libre",
    type: "ACTIVE",
    amount: 3000,
    frequency: "WEEKLY",
    payDayType: "DAY_OF_WEEK",
    payDay: [3],
  };

  const validAnnual = {
    name: "Aguinaldo",
    type: "CHRISTMAS_BONUS",
    amount: 30000,
    frequency: "ANNUAL",
    payDayType: "DAY_OF_MONTH",
    payDay: [20],
    payMonth: [12],
  };

  const validOneTime = {
    name: "Herencia",
    type: "WINDFALL",
    amount: 50000,
    frequency: "ONE_TIME",
    payDayType: "DAY_OF_MONTH",
    oneTimeDate: "2026-06-15",
  };

  it("validates biweekly data", () => {
    expect(incomeSourceSchema.safeParse(validMonthly).success).toBe(true);
  });

  it("validates weekly day of week", () => {
    expect(incomeSourceSchema.safeParse(validWeekly).success).toBe(true);
  });

  it("validates annual with month", () => {
    expect(incomeSourceSchema.safeParse(validAnnual).success).toBe(true);
  });

  it("validates one-time with date", () => {
    const result = incomeSourceSchema.safeParse(validOneTime);
    expect(result.success).toBe(true);
  });

  it("rejects one-time without date", () => {
    const { oneTimeDate, ...noDate } = validOneTime;
    expect(incomeSourceSchema.safeParse(noDate).success).toBe(false);
  });

  it("rejects annual without month", () => {
    const { payMonth, ...noMonth } = validAnnual;
    expect(incomeSourceSchema.safeParse(noMonth).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(incomeSourceSchema.safeParse({ ...validMonthly, name: "" }).success).toBe(false);
  });

  it("rejects negative amount", () => {
    expect(incomeSourceSchema.safeParse({ ...validMonthly, amount: -100 }).success).toBe(false);
  });

  it("rejects day of month out of range", () => {
    expect(incomeSourceSchema.safeParse({ ...validMonthly, payDay: [32] }).success).toBe(false);
  });

  it("rejects day of week out of range", () => {
    expect(incomeSourceSchema.safeParse({ ...validWeekly, payDay: [7] }).success).toBe(false);
  });

  it("accepts isVariable flag", () => {
    const result = incomeSourceSchema.safeParse({ ...validMonthly, isVariable: true });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isVariable).toBe(true);
  });

  it("defaults isVariable to false", () => {
    const result = incomeSourceSchema.safeParse(validMonthly);
    if (result.success) expect(result.data.isVariable).toBe(false);
  });

  it("validates new income types", () => {
    for (const type of ["BONUS", "CHRISTMAS_BONUS", "PROFIT_SHARING", "SAVINGS_FUND", "WINDFALL"]) {
      expect(incomeSourceSchema.safeParse({ ...validMonthly, type }).success).toBe(true);
    }
  });
});
