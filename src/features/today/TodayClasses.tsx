"use client";
// Bugünün dersleri. Şu an devam eden ders vurgulanır, bitenler soluk görünür.
import Link from "next/link";
import { GraduationCap, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/misc";
import { courseColor } from "@/lib/colors";
import { timeToMinutes, weekdayOf } from "@/lib/dates";
import { SESSION_KIND_LABELS } from "@/lib/labels";
import { useCourseMap, useSessionsForDay } from "@/features/courses/hooks";

export function TodayClasses({ now }: { now: Date }) {
  const sessions = useSessionsForDay(weekdayOf(now));
  const courseMap = useCourseMap();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return (
    <Card
      title="Bugünkü dersler"
      icon={<GraduationCap size={16} />}
      action={
        <Link href="/dersler" className="text-xs text-indigo-400">
          Program
        </Link>
      }
    >
      {sessions === undefined ? null : sessions.length === 0 ? (
        <EmptyState text="Bugün ders yok." />
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => {
            const course = courseMap.get(s.courseId);
            const color = courseColor(course?.color);
            const startM = timeToMinutes(s.start);
            const endM = timeToMinutes(s.end);
            const live = nowMin >= startM && nowMin < endM;
            const past = nowMin >= endM;
            const startsIn = startM - nowMin;
            return (
              <li
                key={s.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${live ? color.soft : "border-zinc-800"} ${past ? "opacity-40" : ""}`}
              >
                <span className={`h-8 w-1 rounded-full ${color.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    <span className={color.text}>{course?.code}</span>
                    {s.kind !== "ders" && <span className="text-zinc-400"> · {SESSION_KIND_LABELS[s.kind]}</span>}
                    {course?.name && <span className="text-sm font-normal text-zinc-400"> {course.name}</span>}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="tabular-nums">
                      {s.start}–{s.end}
                    </span>
                    {s.room && (
                      <span className="flex items-center gap-0.5">
                        <MapPin size={11} /> {s.room}
                      </span>
                    )}
                  </p>
                </div>
                {live && <span className="text-xs font-semibold text-emerald-400">Şimdi</span>}
                {!live && !past && startsIn <= 60 && <span className="text-xs text-amber-300">{startsIn} dk</span>}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
