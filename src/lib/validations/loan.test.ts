import { describe, it, expect } from "vitest";
import { loanSchema } from "./loan";

const valid = {
  name: "Crédito automotriz",
  type: "AUTO",
  institution: "BBVA",
  totalAmount: "350000",
  monthlyPayment: "8500",
  interestRate: "12.5",
  startDate: "2025-01-15",
  endDate: "2029-01-15",
  paymentDay: "15",
  remainingBalance: "280000",
};

describe("loanSchema", () => {
  it("accepts valid loan data", () => {
    const result = loanSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = loanSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = loanSchema.safeParse({ ...valid, type: "PERSONAL" });
    expect(result.success).toBe(false);
  });

  it("rejects zero totalAmount", () => {
    const result = loanSchema.safeParse({ ...valid, totalAmount: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative monthlyPayment", () => {
    const result = loanSchema.safeParse({ ...valid, monthlyPayment: "-100" });
    expect(result.success).toBe(false);
  });

  it("rejects negative interestRate", () => {
    const result = loanSchema.safeParse({ ...valid, interestRate: "-1" });
    expect(result.success).toBe(false);
  });

  it("defaults interestRate to 0", () => {
    const { interestRate: _, ...noRate } = valid;
    const result = loanSchema.safeParse(noRate);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.interestRate).toBe(0);
  });

  it("rejects paymentDay outside 1-31", () => {
    expect(loanSchema.safeParse({ ...valid, paymentDay: "0" }).success).toBe(false);
    expect(loanSchema.safeParse({ ...valid, paymentDay: "32" }).success).toBe(false);
  });

  it("rejects endDate before startDate", () => {
    const result = loanSchema.safeParse({ ...valid, startDate: "2029-01-15", endDate: "2025-01-15" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("endDate"))).toBe(true);
    }
  });

  it("rejects remainingBalance greater than totalAmount", () => {
    const result = loanSchema.safeParse({ ...valid, remainingBalance: "400000" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("remainingBalance"))).toBe(true);
    }
  });

  it("accepts remainingBalance equal to totalAmount", () => {
    const result = loanSchema.safeParse({ ...valid, remainingBalance: valid.totalAmount });
    expect(result.success).toBe(true);
  });

  it("coerces string values to correct types", () => {
    const result = loanSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.totalAmount).toBe("number");
      expect(result.data.startDate).toBeInstanceOf(Date);
    }
  });
});
