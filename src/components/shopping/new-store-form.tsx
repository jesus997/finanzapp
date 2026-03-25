"use client";

import { useState } from "react";

interface Props {
  action: (formData: FormData) => Promise<void>;
}

export function NewStoreForm({ action }: Props) {
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        // Reverse geocode with Nominatim (free, no API key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "User-Agent": "FinanzApp/1.0" } },
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) setAddress(data.display_name);
          }
        } catch {
          // Geocoding failed — coordinates still saved
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <form action={action} className="mt-3 space-y-3">
      <input
        type="text"
        name="name"
        placeholder="Nombre de la tienda"
        required
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            name="address"
            placeholder="Dirección (opcional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
            title="Detectar ubicación"
          >
            {locating ? "..." : "📍"}
          </button>
        </div>
        {lat != null && lng != null && (
          <p className="text-xs text-muted-foreground">
            📍 {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        )}
      </div>
      {lat != null && <input type="hidden" name="latitude" value={lat} />}
      {lng != null && <input type="hidden" name="longitude" value={lng} />}
      <button
        type="submit"
        className="w-full rounded-md border px-4 py-2 text-sm hover:bg-muted"
      >
        Agregar tienda
      </button>
    </form>
  );
}
