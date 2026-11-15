"use client";
// Rutin listesinde tek satır: işaret kutusu, başlık, seri, (varsa) dakika ilerlemesi
import { Bell, Flame } from "lucide-react";
import { CheckCircle } from "@/components/ui/misc";
import type { Habit, HabitLog, ISODate } from "@/types";
import { addHabitMinutes, toggleHabit } from "../api";

export function HabitRow({
  habit,
  log,
  date,
  streak,
  overdue,
}: {
  habit: Habit;
  log?: HabitLog;
  date: ISODate;
  streak: number;
  overdue?: boolean; // hatırlatma saati geçti ama yapılmadı
}) {
  const done = !!log?.done;
  const minutes = log?.minutes ?? 0;
  const target = habit.targetMinutes;

  return (
    <li className="py-2.5">
      <div className="flex items-center gap-3">
        <CheckCircle checked={done} onToggle={() => toggleHabit(habit, date)} label={`${habit.title} tamamlandı`} />
        <div className="min-w-0 flex-1">
          <p className={`truncate ${done ? "text-ink-500 line-through" : ""}`}>{habit.title}</p>
          {(habit.remindAt || target) && (
            <p className="flex items-center gap-2 text-xs text-ink-500">
              {habit.remindAt && (
                <span className={`flex items-center gap-0.5 ${overdue ? "text-amber-300" : ""}`}>
                  <Bell size={11} /> {habit.remindAt}
                </span>
              )}
              {target && (
                <span className="tabular-nums">
                  {minutes} / {target} dk
                </span>
              )}
            </p>
          )}
        </div>
        {streak > 0 && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-orange-300" title={`${streak} günlük seri`}>
            <Flame size={14} /> {streak}
          </span>
        )}
      </div>

      {/* Dakika hedefi olanlar için ilerleme çubuğu ve +/- butonları */}
      {target && (
        <div className="mt-2 flex items-center gap-2 pl-9">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-800">
            <div
              className={`h-full rounded-full transition-all ${done ? "bg-brand-300" : "bg-brand-500"}`}
              style={{ width: `${Math.min(100, (minutes / target) * 100)}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => addHabitMinutes(habit, date, -30)}
            disabled={minutes === 0}
            className="h-7 rounded-lg bg-ink-800 px-2 text-xs text-ink-300 disabled:opacity-40"
          >
            −30
          </button>
          <button
            type="button"
            onClick={() => addHabitMinutes(habit, date, 30)}
            className="h-7 rounded-lg bg-ink-800 px-2 text-xs text-ink-300"
          >
            +30 dk
          </button>
        </div>
      )}
    </li>
  );
}
