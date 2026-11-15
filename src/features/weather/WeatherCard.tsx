"use client";
import { Droplets, RefreshCw, Wind } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { LOCATION, describeWeather } from "./api";
import { useWeather } from "./useWeather";

export function WeatherCard() {
  const { weather, error, loading, refresh } = useWeather();

  if (!weather) {
    return (
      <section className="flex h-28 items-center justify-between rounded-3xl p-5 text-sm border border-ink-900 bg-gradient-to-br from-brand-500/85 via-brand-700/85 to-brand-900/90 text-white backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_14px_34px_-18px_rgb(58_39_23/0.7)]">
        <span>{error ? `${error}.` : "Hava durumu yükleniyor..."}</span>
        {error && (
          <IconButton onClick={refresh} aria-label="Yenile" className="text-brand-100 hover:!bg-white/15 hover:!text-white">
            <RefreshCw size={16} />
          </IconButton>
        )}
      </section>
    );
  }

  const { label, icon: Icon } = describeWeather(weather.code, weather.isDay);
  const r = Math.round;

  return (
    <section className="relative overflow-hidden rounded-3xl p-5 border border-ink-900 bg-gradient-to-br from-brand-500/85 via-brand-700/85 to-brand-900/90 text-white backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_14px_34px_-18px_rgb(58_39_23/0.7)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-100">{LOCATION.name}</p>
          <p className="mt-1 font-display text-6xl font-semibold tracking-tighter tabular-nums">{r(weather.temp)}°</p>
          <p className="text-sm text-brand-50">{label}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Icon size={44} strokeWidth={1.5} className="text-brand-100" />
          <IconButton onClick={refresh} aria-label="Yenile" className="!h-7 !w-7 text-brand-100 hover:!bg-white/15 hover:!text-white">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </IconButton>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/25 pt-3 text-xs text-brand-50">
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
