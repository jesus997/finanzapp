"use client";

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text)}
      className="text-xs text-primary hover:underline"
    >
      Copiar enlace
    </button>
  );
}
