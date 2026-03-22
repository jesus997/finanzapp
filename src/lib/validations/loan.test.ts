import { describe, it, expect } from "vitest";
import { loanSchema, estimateEndDate } from "./loan";

const valid = {
  name: "Crédito automotriz",
  type: "AUTO",
  institution: "BBVA",
  totalAmount: "350000",
  monthlyPayment: "8500",
  interestRate: "12.5",
  startDate: "2025-01-15",
  endDate: "2029-01-15",
  cutOffDay: "15",
  paymentDueDay: "15",
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

  it("rejects paymentDueDay outside 1-31", () => {
    expect(loanSchema.safeParse({ ...valid, paymentDueDay: "0" }).success).toBe(false);
    expect(loanSchema.safeParse({ ...valid, paymentDueDay: "32" }).success).toBe(false);
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

  it("accepts empty endDate (optional)", () => {
    const result = loanSchema.safeParse({ ...valid, endDate: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.endDate).toBeUndefined();
  });

  it("accepts missing endDate", () => {
    const { endDate: _, ...noEnd } = valid;
    const result = loanSchema.safeParse(noEnd);
    expect(result.success).toBe(true);
  });

  it("accepts empty cutOffDay (optional)", () => {
    const result = loanSchema.safeParse({ ...valid, cutOffDay: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.cutOffDay).toBeUndefined();
  });

  it("accepts missing cutOffDay", () => {
    const { cutOffDay: _, ...noCutOff } = valid;
    const result = loanSchema.safeParse(noCutOff);
    expect(result.success).toBe(true);
  });

  it("rejects cutOffDay outside 1-31", () => {
    expect(loanSchema.safeParse({ ...valid, cutOffDay: "0" }).success).toBe(false);
    expect(loanSchema.safeParse({ ...valid, cutOffDay: "32" }).success).toBe(false);
  });
});

describe("estimateEndDate", () => {
  it("estimates end date from remaining balance and monthly payment", () => {
    const start = new Date("2025-01-15");
    const result = estimateEndDate(start, 24000, 8000);
    // 24000 / 8000 = 3 months
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(3); // April (0-indexed)
  });

  it("rounds up partial months", () => {
    const start = new Date("2025-01-15");
    const result = estimateEndDate(start, 25000, 8000);
    // ceil(25000 / 8000) = 4 months
    expect(result.getMonth()).toBe(4); // May
  });
});
