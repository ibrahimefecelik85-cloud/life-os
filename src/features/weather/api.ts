// Open-Meteo hava durumu servisi (ücretsiz, anahtar gerektirmez).
// Konum: Çekmeköy, İstanbul. Başka bir konum için koordinatları değiştirmen yeterli.
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

export const LOCATION = { name: "Çekmeköy", latitude: 41.03, longitude: 29.18 };

export interface Weather {
  temp: number;
  feelsLike: number;
  wind: number; // km/sa
  code: number;
  isDay: boolean;
  max: number;
  min: number;
  rainChance: number | null; // %
  fetchedAt: number;
}

export async function fetchWeather(): Promise<Weather> {
  const params = new URLSearchParams({
    latitude: String(LOCATION.latitude),
    longitude: String(LOCATION.longitude),
    current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "Europe/Istanbul",
    forecast_days: "1",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Hava durumu alınamadı (${res.status})`);
  const d = await res.json();
  return {
    temp: d.current.temperature_2m,
    feelsLike: d.current.apparent_temperature,
    wind: d.current.wind_speed_10m,
    code: d.current.weather_code,
    isDay: d.current.is_day === 1,
    max: d.daily.temperature_2m_max[0],
    min: d.daily.temperature_2m_min[0],
    rainChance: d.daily.precipitation_probability_max?.[0] ?? null,
    fetchedAt: Date.now(),
  };
}

/** WMO hava kodunu Türkçe açıklama ve ikona çevirir */
export function describeWeather(code: number, isDay = true): { label: string; icon: LucideIcon } {
  if (code === 0) return { label: "Açık", icon: isDay ? Sun : Moon };
  if (code <= 2) return { label: "Parçalı bulutlu", icon: isDay ? CloudSun : CloudMoon };
  if (code === 3) return { label: "Kapalı", icon: Cloud };
  if (code <= 48) return { label: "Sisli", icon: CloudFog };
  if (code <= 57) return { label: "Çisenti", icon: CloudDrizzle };
  if (code <= 67) return { label: "Yağmurlu", icon: CloudRain };
  if (code <= 77) return { label: "Karlı", icon: CloudSnow };
  if (code <= 82) return { label: "Sağanak", icon: CloudRain };
  if (code <= 86) return { label: "Kar sağanağı", icon: CloudSnow };
  return { label: "Gök gürültülü fırtına", icon: CloudLightning };
}
