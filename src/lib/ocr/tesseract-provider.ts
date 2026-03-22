import Tesseract from "tesseract.js";
import type { OcrProvider, OcrResult } from "./types";

export const tesseractProvider: OcrProvider = {
  async extractText(imageData) {
    const { data } = await Tesseract.recognize(imageData, "spa");
    return { text: data.text };
  },
};
