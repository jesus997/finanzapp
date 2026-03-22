import { describe, it, expect } from "vitest";
import { calculateAmortization, INTEREST_TAX_RATE } from "./amortization";

describe("calculateAmortization", () => {
  const base = {
    totalAmount: 120000,
    monthlyPayment: 5000,
    annualRate: 12,
    startDate: new Date("2025-01-01"),
    remainingBalance: 120000,
  };

  it("generates a schedule that reaches zero balance", () => {
    const result = calculateAmortization(
      base.totalAmount, base.monthlyPayment, base.annualRate, base.startDate, base.remainingBalance,
    );
    const last = result.schedule[result.schedule.length - 1];
    expect(last.balance).toBe(0);
    expect(result.insufficientPayment).toBe(false);
  });

  it("first month interest includes IVA", () => {
    const result = calculateAmortization(
      base.totalAmount, base.monthlyPayment, base.annualRate, base.startDate, base.remainingBalance,
    );
    // 120000 * (12/12/100) * 1.16 = 1392
    const expected = Math.round(120000 * (0.12 / 12) * (1 + INTEREST_TAX_RATE) * 100) / 100;
    expect(result.schedule[0].interest).toBe(expected);
  });

  it("totalPaid equals totalAmount + totalInterest", () => {
    const result = calculateAmortization(
      base.totalAmount, base.monthlyPayment, base.annualRate, base.startDate, base.remainingBalance,
    );
    expect(result.totalPaid).toBe(result.totalInterest + base.totalAmount);
  });

  it("interest decreases over time", () => {
    const result = calculateAmortization(
      base.totalAmount, base.monthlyPayment, base.annualRate, base.startDate, base.remainingBalance,
    );
    expect(result.schedule[0].interest).toBeGreaterThan(
      result.schedule[result.schedule.length - 1].interest,
    );
  });

  it("handles zero interest rate", () => {
    const result = calculateAmortization(
      base.totalAmount, base.monthlyPayment, 0, base.startDate, base.remainingBalance,
    );
    expect(result.totalInterest).toBe(0);
    expect(result.schedule[0].principal).toBe(5000);
    expect(result.insufficientPayment).toBe(false);
  });

  it("flags insufficient payment and stops early", () => {
    const result = calculateAmortization(
      1000000, 8500, 12, new Date("2025-01-01"), 1000000,
    );
    // monthlyRate=1% + 16% IVA = interest ~11600 > payment 8500
    expect(result.insufficientPayment).toBe(true);
    expect(result.schedule.length).toBeLessThan(1200);
  });
});
