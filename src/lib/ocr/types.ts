/** OCR provider interface — Tesseract now, OpenAI Vision later */
export interface OcrResult {
  text: string;
}

export interface OcrProvider {
  extractText(imageData: string | File | Blob): Promise<OcrResult>;
}
