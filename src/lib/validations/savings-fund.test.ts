import { describe, it, expect } from "vitest";
import { savingsFundSchema } from "./savings-fund";

describe("savingsFundSchema", () => {
  it("accepts valid fixed amount fund", () => {
    const result = savingsFundSchema.safeParse({
      name: "Emergencia",
      type: "FIXED_AMOUNT",
      value: 500,
      frequency: "MONTHLY",
      incomeSourceId: "src-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid percentage fund", () => {
    const result = savingsFundSchema.safeParse({
      name: "Vacaciones",
      type: "PERCENTAGE",
      value: 10,
      incomeSourceId: "src-1",
    });
    expect(result.success).toBe(true);
  });

  it("defaults frequency to MONTHLY", () => {
    const result = savingsFundSchema.safeParse({
      name: "Test",
      type: "FIXED_AMOUNT",
      value: 100,
      incomeSourceId: "src-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.frequency).toBe("MONTHLY");
    }
  });

  it("accepts weekly frequency", () => {
    const result = savingsFundSchema.safeParse({
      name: "Semanal",
      type: "FIXED_AMOUNT",
      value: 200,
      frequency: "WEEKLY",
      incomeSourceId: "src-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts biweekly frequency", () => {
    const result = savingsFundSchema.safeParse({
      name: "Quincenal",
      type: "FIXED_AMOUNT",
      value: 500,
      frequency: "BIWEEKLY",
      incomeSourceId: "src-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid frequency", () => {
    const result = savingsFundSchema.safeParse({
      name: "Test",
      type: "FIXED_AMOUNT",
      value: 100,
      frequency: "DAILY",
      incomeSourceId: "src-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects percentage over 100", () => {
    const result = savingsFundSchema.safeParse({
      name: "Test",
      type: "PERCENTAGE",
      value: 150,
      incomeSourceId: "src-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero value", () => {
    const result = savingsFundSchema.safeParse({
      name: "Test",
      type: "FIXED_AMOUNT",
      value: 0,
      incomeSourceId: "src-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = savingsFundSchema.safeParse({
      name: "",
      type: "FIXED_AMOUNT",
      value: 100,
      incomeSourceId: "src-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing income source", () => {
    const result = savingsFundSchema.safeParse({
      name: "Test",
      type: "FIXED_AMOUNT",
      value: 100,
      incomeSourceId: "",
    });
    expect(result.success).toBe(false);
  });

  it("defaults accumulated balance to 0", () => {
    const result = savingsFundSchema.safeParse({
      name: "Test",
      type: "FIXED_AMOUNT",
      value: 100,
      incomeSourceId: "src-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accumulatedBalance).toBe(0);
    }
  });
});
