"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let scanner: import("html5-qrcode").Html5Qrcode | null = null;
    let stopped = false;

    const safeStop = async () => {
      if (stopped || !scanner) return;
      stopped = true;
      try {
        const state = scanner.getState();
        if (state === 2 /* SCANNING */ || state === 3 /* PAUSED */) {
          await scanner.stop();
        }
      } catch {
        // ignore
      }
      try { scanner.clear(); } catch { /* ignore */ }
    };

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (stopped) return;

        const scannerId = "barcode-scanner";
        containerRef.current!.id = scannerId;
        scanner = new Html5Qrcode(scannerId);

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            if (scannedRef.current) return;
            scannedRef.current = true;
            safeStop().then(() => onScan(decodedText));
          },
          () => {},
        );
      } catch {
        if (!stopped) setError("No se pudo acceder a la cámara");
      }
    })();

    return () => { safeStop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Escanea el código de barras</p>
        <button onClick={onClose} className="text-sm text-muted-foreground hover:underline">
          Cancelar
        </button>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <div ref={containerRef} className="overflow-hidden rounded-lg" />
      )}
    </div>
  );
}
