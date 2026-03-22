export interface ParsedReceipt {
  storeName: string | null;
  total: number | null;
  date: string | null; // YYYY-MM-DD
}

/**
 * Parses OCR text from a Mexican receipt to extract store name, total and date.
 * Heuristic-based — works best with common supermarket/store formats.
 */
export function parseReceipt(text: string): ParsedReceipt {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  return {
    storeName: extractStoreName(lines),
    total: extractTotal(lines),
    date: extractDate(text),
  };
}

function extractStoreName(lines: string[]): string | null {
  // First non-empty line that looks like a name (not a number/date/address)
  for (const line of lines.slice(0, 5)) {
    const clean = line.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, "").trim();
    if (clean.length >= 3) return clean;
  }
  return null;
}

function extractTotal(lines: string[]): number | null {
  // Search from bottom up for TOTAL line with amount
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].toUpperCase();
    if (/TOTAL/.test(line) && !/SUB\s*TOTAL/.test(line)) {
      const match = line.match(/\$?\s*([\d,]+\.\d{2})/);
      if (match) return parseFloat(match[1].replace(/,/g, ""));
    }
  }
  // Fallback: any line with $ amount near bottom
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
    const match = lines[i].match(/\$\s*([\d,]+\.\d{2})/);
    if (match) return parseFloat(match[1].replace(/,/g, ""));
  }
  return null;
}

function extractDate(text: string): string | null {
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = text.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  // YYYY-MM-DD
  const ymd = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

  return null;
}
