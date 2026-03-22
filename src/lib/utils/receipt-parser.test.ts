import { describe, it, expect } from "vitest";
import { parseReceipt } from "./receipt-parser";

describe("parseReceipt", () => {
  it("extracts store name from first lines", () => {
    const text = "WALMART SUPERCENTER\nSUC 1234\nRFC WAL...\nTOTAL $350.00";
    expect(parseReceipt(text).storeName).toBe("WALMART SUPERCENTER");
  });

  it("extracts total from TOTAL line", () => {
    const text = "SUBTOTAL $300.00\nIVA $48.00\nTOTAL $348.00";
    expect(parseReceipt(text).total).toBe(348.0);
  });

  it("extracts total with comma thousands", () => {
    const text = "TOTAL $1,234.56";
    expect(parseReceipt(text).total).toBe(1234.56);
  });

  it("extracts date DD/MM/YYYY", () => {
    const text = "FECHA: 22/03/2026\nTOTAL $100.00";
    expect(parseReceipt(text).date).toBe("2026-03-22");
  });

  it("extracts date DD-MM-YYYY", () => {
    const text = "22-03-2026\nTOTAL $100.00";
    expect(parseReceipt(text).date).toBe("2026-03-22");
  });

  it("returns nulls for unparseable text", () => {
    const result = parseReceipt("random noise");
    expect(result.total).toBeNull();
    expect(result.date).toBeNull();
  });

  it("ignores SUBTOTAL when looking for TOTAL", () => {
    const text = "SUBTOTAL $200.00\nTOTAL $232.00";
    expect(parseReceipt(text).total).toBe(232.0);
  });

  it("falls back to $ amount near bottom", () => {
    const text = "TIENDA\nPRODUCTO 1\n$50.00\n$150.00";
    expect(parseReceipt(text).total).toBe(150.0);
  });
});
