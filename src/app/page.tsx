"use client";
// Ana ekran: "Bugün"
// Telefonda tek sütun; bilgisayarda (lg ve üstü) iki sütun:
//   sol: hava durumu + takvim   |   sağ: yapılacaklar, dersler, rutin, teslimler, bütçe
import Link from "next/link";
import { CalendarDays, Settings } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { useNow } from "@/hooks/useNow";
import { formatLong } from "@/lib/dates";
import { WeatherCard } from "@/features/weather/WeatherCard";
import { CalendarPanel } from "@/features/calendar/components/CalendarPanel";
import { TodayClasses } from "@/features/today/TodayClasses";
import { UpcomingCard } from "@/features/today/UpcomingCard";
import { TodayTodos } from "@/features/today/TodayTodos";
import { HabitsCard } from "@/features/habits/components/HabitsCard";
import { BudgetTodayCard } from "@/features/budget/components/BudgetTodayCard";

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
      {/* Üst şerit: logo + uygulama adı, sağda ayarlar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="text-lg font-bold tracking-tight text-ink-950">Life OS</span>
        </div>
        <Link
          href="/ayarlar"
          aria-label="Ayarlar"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 hover:bg-white/50 hover:text-ink-900"
        >
          <Settings size={20} />
        </Link>
      </div>
      <PageHeader title={now ? greeting(now.getHours()) : "Bugün"} subtitle={now ? formatLong(now) : "\u00a0"} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        {/* Sol sütun */}
        <div className="space-y-4">
          <WeatherCard />
          {now && (
            <Card
              title="Takvim"
              icon={<CalendarDays size={16} />}
              action={
                <Link href="/takvim" className="text-xs text-brand-600">
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
            <BudgetTodayCard now={now} />
          </div>
        )}
      </div>
    </>
  );
}
