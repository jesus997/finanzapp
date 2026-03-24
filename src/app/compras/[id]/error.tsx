"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Error en la compra</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="text-sm underline">
        Reintentar
      </button>
    </div>
  );
}
