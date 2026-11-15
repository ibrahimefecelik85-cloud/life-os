"use client";
import { Droplets, RefreshCw, Wind } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { LOCATION, describeWeather } from "./api";
import { useWeather } from "./useWeather";

export function WeatherCard() {
  const { weather, error, loading, refresh } = useWeather();

  if (!weather) {
    return (
      <section className="flex h-28 items-center justify-between rounded-2xl border border-ink-800 bg-ink-900/60 p-4 text-sm text-ink-500">
        <span>{error ? `${error}.` : "Hava durumu yükleniyor..."}</span>
        {error && (
          <IconButton onClick={refresh} aria-label="Yenile">
            <RefreshCw size={16} />
          </IconButton>
        )}
      </section>
    );
  }

  const { label, icon: Icon } = describeWeather(weather.code, weather.isDay);
  const r = Math.round;

  return (
    <section className="rounded-2xl border border-ink-800 bg-gradient-to-br from-brand-500/15 to-ink-900/60 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400">{LOCATION.name}</p>
          <p className="mt-1 font-display text-5xl font-medium tabular-nums text-ink-50">{r(weather.temp)}°</p>
          <p className="text-sm text-ink-300">{label}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Icon size={44} strokeWidth={1.5} className="text-brand-300" />
          <IconButton onClick={refresh} aria-label="Yenile" className="!h-7 !w-7">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </IconButton>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
        <span>
          En yüksek {r(weather.max)}° · En düşük {r(weather.min)}°
        </span>
        <span>Hissedilen {r(weather.feelsLike)}°</span>
        {weather.rainChance !== null && (
          <span className="flex items-center gap-1">
            <Droplets size={12} /> %{weather.rainChance}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Wind size={12} /> {r(weather.wind)} km/sa
        </span>
      </div>
    </section>
  );
}
