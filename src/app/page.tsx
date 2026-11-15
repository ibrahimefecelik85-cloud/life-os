"use client";
// Ana ekran: "Bugün"
// Telefonda tek sütun; bilgisayarda (lg ve üstü) iki sütun:
//   sol: hava durumu + takvim   |   sağ: yapılacaklar, dersler, rutin, teslimler, antrenman
import Link from "next/link";
import { CalendarDays, Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { useNow } from "@/hooks/useNow";
import { formatLong } from "@/lib/dates";
import { WeatherCard } from "@/features/weather/WeatherCard";
import { CalendarPanel } from "@/features/calendar/components/CalendarPanel";
import { TodayClasses } from "@/features/today/TodayClasses";
import { UpcomingCard } from "@/features/today/UpcomingCard";
import { TodayTodos } from "@/features/today/TodayTodos";
import { TodayWorkout } from "@/features/today/TodayWorkout";
import { HabitsCard } from "@/features/habits/components/HabitsCard";

function greeting(h: number) {
  if (h < 5) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

export default function TodayPage() {
  const now = useNow();

  return (
    <>
      <PageHeader
        title={now ? greeting(now.getHours()) : "Bugün"}
        subtitle={now ? formatLong(now) : " "}
        action={
          <Link
            href="/ayarlar"
            aria-label="Ayarlar"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Settings size={20} />
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        {/* Sol sütun */}
        <div className="space-y-4">
          <WeatherCard />
          {now && (
            <Card
              title="Takvim"
              icon={<CalendarDays size={16} />}
              action={
                <Link href="/takvim" className="text-xs text-indigo-400">
                  Tam ekran
                </Link>
              }
            >
              <CalendarPanel now={now} embedded />
            </Card>
          )}
        </div>

        {/* Sağ sütun */}
        {now && (
          <div className="space-y-4">
            <TodayTodos now={now} />
            <TodayClasses now={now} />
            <HabitsCard now={now} />
            <UpcomingCard now={now} />
            <TodayWorkout />
          </div>
        )}
      </div>
    </>
  );
}
