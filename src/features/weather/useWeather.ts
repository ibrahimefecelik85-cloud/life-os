"use client";
// Hava durumunu getirir. Son sonucu tarayıcıda saklar:
// - 30 dakikadan yeniyse tekrar istek atmaz
// - internet yoksa son bilinen değeri gösterir
import { useCallback, useEffect, useState } from "react";
import { fetchWeather, type Weather } from "./api";

const CACHE_KEY = "life-os:weather";
const MAX_AGE = 30 * 60 * 1000;

function readCache(): Weather | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Weather) : null;
  } catch {
    return null;
  }
}

export function useWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const w = await fetchWeather();
      setWeather(w);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(w));
      } catch {
        /* depolama kapalıysa önemli değil */
      }
    } catch (e) {
      // fetch, internet yoksa İngilizce "Failed to fetch" (TypeError) fırlatır; Türkçeleştir
      setError(
        e instanceof TypeError
          ? "Hava durumu alınamadı, internet bağlantını kontrol et"
          : e instanceof Error
            ? e.message
            : "Hava durumu alınamadı",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Dış sistemle (tarayıcı deposu + ağ) senkronizasyon: effect içinde yapılması doğru
    const cached = readCache();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cached) setWeather(cached);
    if (!cached || Date.now() - cached.fetchedAt > MAX_AGE) void refresh();
  }, [refresh]);

  return { weather, error, loading, refresh };
}
