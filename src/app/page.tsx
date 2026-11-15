"use client";
// Ana ekran: "Bugün"
import Link from "next/link";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNow } from "@/hooks/useNow";
import { formatLong } from "@/lib/dates";
import { WeatherCard } from "@/features/weather/WeatherCard";
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
      <div className="space-y-4">
        <WeatherCard />
        {now && (
          <>
            <TodayClasses now={now} />
            <HabitsCard now={now} />
            <UpcomingCard now={now} />
            <TodayWorkout />
            <TodayTodos now={now} />
          </>
        )}
      </div>
    </>
  );
}
