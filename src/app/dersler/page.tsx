"use client";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/misc";
import { useNow } from "@/hooks/useNow";
import { AssessmentsTab } from "@/features/courses/components/AssessmentsTab";
import { CoursesTab } from "@/features/courses/components/CoursesTab";
import { ScheduleTab } from "@/features/courses/components/ScheduleTab";
import { WeekTab } from "@/features/courses/components/WeekTab";

type Tab = "hafta" | "teslimler" | "program" | "dersler";
const TABS: { value: Tab; label: string }[] = [
  { value: "hafta", label: "Bu Hafta" },
  { value: "teslimler", label: "Teslimler" },
  { value: "program", label: "Program" },
  { value: "dersler", label: "Dersler" },
];

export default function DerslerPage() {
  const [tab, setTab] = useState<Tab>("hafta");
  const now = useNow();

  return (
    <>
      <PageHeader title="Dersler" />
      <Tabs value={tab} tabs={TABS} onChange={setTab} />
      {/* Tarih bilgisi tarayıcıda hazır olunca göster */}
      {now && (
        <>
          {tab === "hafta" && <WeekTab now={now} />}
          {tab === "teslimler" && <AssessmentsTab now={now} />}
          {tab === "program" && <ScheduleTab now={now} />}
          {tab === "dersler" && <CoursesTab />}
        </>
      )}
    </>
  );
}
