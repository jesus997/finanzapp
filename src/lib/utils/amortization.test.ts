import { describe, it, expect } from "vitest";
import { calculateAmortization, INTEREST_TAX_RATE, periodsPerYear } from "./amortization";

describe("periodsPerYear", () => {
  it("returns correct periods", () => {
    expect(periodsPerYear("DAILY")).toBe(360);
    expect(periodsPerYear("WEEKLY")).toBe(52);
    expect(periodsPerYear("BIWEEKLY")).toBe(24);
    expect(periodsPerYear("MONTHLY")).toBe(12);
  });
});

describe("calculateAmortization", () => {
  const base = {
    totalAmount: 120000,
    paymentAmount: 5000,
    annualRate: 12,
    frequency: "MONTHLY",
    startDate: new Date("2025-01-01"),
    remainingBalance: 120000,
  };

  it("generates a schedule that reaches zero balance", () => {
    const result = calculateAmortization(
      base.totalAmount, base.paymentAmount, base.annualRate, base.frequency, base.startDate, base.remainingBalance,
    );
    const last = result.schedule[result.schedule.length - 1];
    expect(last.balance).toBe(0);
    expect(result.insufficientPayment).toBe(false);
  });

  it("first period interest includes IVA", () => {
    const result = calculateAmortization(
      base.totalAmount, base.paymentAmount, base.annualRate, base.frequency, base.startDate, base.remainingBalance,
    );
    const expected = Math.round(120000 * (0.12 / 12) * (1 + INTEREST_TAX_RATE) * 100) / 100;
    expect(result.schedule[0].interest).toBe(expected);
  });

  it("totalPaid equals totalAmount + totalInterest", () => {
    const result = calculateAmortization(
      base.totalAmount, base.paymentAmount, base.annualRate, base.frequency, base.startDate, base.remainingBalance,
    );
    expect(result.totalPaid).toBe(result.totalInterest + base.totalAmount);
  });

  it("handles zero interest rate", () => {
    const result = calculateAmortization(
      base.totalAmount, base.paymentAmount, 0, base.frequency, base.startDate, base.remainingBalance,
    );
    expect(result.totalInterest).toBe(0);
    expect(result.insufficientPayment).toBe(false);
  });

  it("flags insufficient payment and stops early", () => {
    const result = calculateAmortization(
      1000000, 8500, 12, "MONTHLY", new Date("2025-01-01"), 1000000,
    );
    expect(result.insufficientPayment).toBe(true);
    expect(result.schedule.length).toBeLessThan(1200);
  });

  it("biweekly pays less total interest than monthly with same payment amount", () => {
    const monthly = calculateAmortization(
      base.totalAmount, 2500, base.annualRate, "MONTHLY", base.startDate, base.remainingBalance,
    );
    const biweekly = calculateAmortization(
      base.totalAmount, 2500, base.annualRate, "BIWEEKLY", base.startDate, base.remainingBalance,
    );
    if (!monthly.insufficientPayment && !biweekly.insufficientPayment) {
      expect(biweekly.totalInterest).toBeLessThan(monthly.totalInterest);
    }
  });
});
