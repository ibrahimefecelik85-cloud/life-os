"use client";
import { Droplets, RefreshCw, Wind } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { LOCATION, describeWeather } from "./api";
import { useWeather } from "./useWeather";

export function WeatherCard() {
  const { weather, error, loading, refresh } = useWeather();

  if (!weather) {
    return (
      <section className="flex h-28 items-center justify-between rounded-3xl bg-ink-900 p-5 text-sm text-ink-300">
        <span>{error ? `${error}.` : "Hava durumu yükleniyor..."}</span>
        {error && (
          <IconButton onClick={refresh} aria-label="Yenile" className="text-ink-300 hover:!bg-white/10 hover:!text-white">
            <RefreshCw size={16} />
          </IconButton>
        )}
      </section>
    );
  }

  const { label, icon: Icon } = describeWeather(weather.code, weather.isDay);
  const r = Math.round;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-900 to-brand-900 p-5 text-white shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-300">{LOCATION.name}</p>
          <p className="mt-1 font-display text-6xl font-semibold tracking-tighter tabular-nums">{r(weather.temp)}°</p>
          <p className="text-sm text-ink-300">{label}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Icon size={44} strokeWidth={1.5} className="text-brand-300" />
          <IconButton onClick={refresh} aria-label="Yenile" className="!h-7 !w-7 text-ink-400 hover:!bg-white/10 hover:!text-white">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </IconButton>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-xs text-ink-300">
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
