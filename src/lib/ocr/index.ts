import type { OcrProvider } from "./types";
import { tesseractProvider } from "./tesseract-provider";

export type { OcrProvider, OcrResult } from "./types";

/** Returns the active OCR provider. Swap to Vision provider when AI module is added. */
export function getOcrProvider(): OcrProvider {
  // Future: if (process.env.OPENAI_API_KEY) return visionProvider;
  return tesseractProvider;
}
