import { describe, it, expect } from "vitest";
import { cardSchema } from "./card";

describe("cardSchema", () => {
  const validDebit = {
    name: "Nubank",
    bank: "Nu México",
    lastFourDigits: "1234",
    type: "DEBIT",
    network: "MASTERCARD",
  };

  const validCredit = {
    name: "Liverpool",
    bank: "Liverpool",
    lastFourDigits: "5678",
    type: "CREDIT",
    network: "VISA",
    creditLimit: 50000,
    cutOffDay: 15,
    paymentDay: 5,
    interestRate: 36.5,
  };

  it("validates debit card", () => {
    const result = cardSchema.safeParse(validDebit);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.creditLimit).toBeNull();
      expect(result.data.cutOffDay).toBeNull();
    }
  });

  it("validates credit card", () => {
    const result = cardSchema.safeParse(validCredit);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.creditLimit).toBe(50000);
      expect(result.data.cutOffDay).toBe(15);
    }
  });

  it("rejects credit card without creditLimit", () => {
    const { creditLimit, ...noLimit } = validCredit;
    expect(cardSchema.safeParse(noLimit).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(cardSchema.safeParse({ ...validDebit, name: "" }).success).toBe(false);
  });

  it("rejects invalid lastFourDigits", () => {
    expect(cardSchema.safeParse({ ...validDebit, lastFourDigits: "12" }).success).toBe(false);
    expect(cardSchema.safeParse({ ...validDebit, lastFourDigits: "abcd" }).success).toBe(false);
  });

  it("rejects invalid network", () => {
    expect(cardSchema.safeParse({ ...validDebit, network: "DISCOVER" }).success).toBe(false);
  });

  it("nullifies credit fields for debit cards", () => {
    const result = cardSchema.safeParse({
      ...validDebit,
      creditLimit: 10000,
      cutOffDay: 15,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.creditLimit).toBeNull();
      expect(result.data.cutOffDay).toBeNull();
    }
  });
});
