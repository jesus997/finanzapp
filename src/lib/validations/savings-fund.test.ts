import { describe, it, expect } from "vitest";
import { savingsFundSchema } from "./savings-fund";

const valid = {
  name: "Fondo de emergencia",
  type: "FIXED_AMOUNT",
  value: "5000",
  incomeSourceId: "income-123",
  accumulatedBalance: "15000",
};

describe("savingsFundSchema", () => {
  it("accepts valid fixed amount", () => {
    expect(savingsFundSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts valid percentage", () => {
    const result = savingsFundSchema.safeParse({ ...valid, type: "PERCENTAGE", value: "10" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(savingsFundSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects zero value", () => {
    expect(savingsFundSchema.safeParse({ ...valid, value: "0" }).success).toBe(false);
  });

  it("rejects percentage over 100", () => {
    const result = savingsFundSchema.safeParse({ ...valid, type: "PERCENTAGE", value: "101" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("value"))).toBe(true);
    }
  });

  it("allows fixed amount over 100", () => {
    expect(savingsFundSchema.safeParse({ ...valid, type: "FIXED_AMOUNT", value: "50000" }).success).toBe(true);
  });

  it("rejects empty incomeSourceId", () => {
    expect(savingsFundSchema.safeParse({ ...valid, incomeSourceId: "" }).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(savingsFundSchema.safeParse({ ...valid, type: "MONTHLY" }).success).toBe(false);
  });

  it("defaults accumulatedBalance to 0", () => {
    const { accumulatedBalance: _, ...noBalance } = valid;
    const result = savingsFundSchema.safeParse(noBalance);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.accumulatedBalance).toBe(0);
  });
});
