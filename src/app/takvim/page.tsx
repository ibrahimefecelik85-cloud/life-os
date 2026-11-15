"use client";
// Aylık takvim: ödevler, sınavlar, görevler ve etkinlikler tek bakışta
import { PageHeader } from "@/components/layout/PageHeader";
import { useNow } from "@/hooks/useNow";
import { CalendarPanel } from "@/features/calendar/components/CalendarPanel";

export default function TakvimPage() {
  const now = useNow();
  return (
    <>
      <PageHeader title="Takvim" />
      {now && <CalendarPanel now={now} />}
    </>
  );
}
