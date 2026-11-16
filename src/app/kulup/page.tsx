"use client";
// Kulüp (Martial Arts): sıradaki etkinlik, etkinlik listesi, gelişmeler ve kulüp görevleri
import { useState } from "react";
import { CalendarPlus, ListTodo, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, Tabs } from "@/components/ui/misc";
import { useNow } from "@/hooks/useNow";
import { toISODate } from "@/lib/dates";
import { ClubEventFormModal } from "@/features/club/components/ClubEventFormModal";
import { ClubEventItem } from "@/features/club/components/ClubEventItem";
import { ClubNotesTab } from "@/features/club/components/ClubNotesTab";
import { NextEventHero } from "@/features/club/components/NextEventHero";
import { useClubEvents } from "@/features/club/hooks";
import { useTodos } from "@/features/todos/hooks";
import { QuickAddTodo } from "@/features/todos/components/QuickAddTodo";
import { TodoFormModal } from "@/features/todos/components/TodoFormModal";
import { TodoItem } from "@/features/todos/components/TodoItem";
import type { ClubEvent, Todo } from "@/types";

type Tab = "etkinlikler" | "gelismeler" | "gorevler";
const TABS: { value: Tab; label: string }[] = [
  { value: "etkinlikler", label: "Etkinlikler" },
  { value: "gelismeler", label: "Gelişmeler" },
  { value: "gorevler", label: "Görevler" },
];

export default function KulupPage() {
  const now = useNow();
  return (
    <>
      <PageHeader title="Kulüp" subtitle="Martial Arts Kulübü" />
      {now && <Club now={now} />}
    </>
  );
}

function Club({ now }: { now: Date }) {
  const today = toISODate(now);
  const [tab, setTab] = useState<Tab>("etkinlikler");
  const [editing, setEditing] = useState<{ item?: ClubEvent } | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const events = useClubEvents();
  const todos = useTodos();
  const upcoming = (events ?? []).filter((e) => e.date >= today);
  const past = (events ?? []).filter((e) => e.date < today).reverse();
  const clubTodos = (todos ?? []).filter((t) => t.category === "kulup" && !t.done);

  return (
    <div className="space-y-4">
      <NextEventHero ev={upcoming[0]} now={now} onOpen={(item) => setEditing({ item })} onAdd={() => setEditing({})} />
      <Tabs value={tab} tabs={TABS} onChange={setTab} />

      {tab === "etkinlikler" && (
        <>
          <Card title="Yaklaşan" icon={<Trophy size={16} />}>
            {events === undefined ? null : upcoming.length === 0 ? (
              <EmptyState text="Yaklaşan etkinlik yok." />
            ) : (
              <ul className="divide-y divide-ink-900/15">
                {upcoming.map((ev) => (
                  <ClubEventItem key={ev.id} ev={ev} now={now} onEdit={(item) => setEditing({ item })} />
                ))}
              </ul>
            )}
          </Card>
          <Button className="w-full" onClick={() => setEditing({})}>
            <CalendarPlus size={18} /> Etkinlik ekle
          </Button>
          {past.length > 0 && (
            <div>
              <button type="button" onClick={() => setShowPast((s) => !s)} className="text-sm text-ink-600 hover:text-ink-900">
                {showPast ? "▾" : "▸"} Geçmiş etkinlikler ({past.length})
              </button>
              {showPast && (
                <ul className="mt-2 divide-y divide-ink-900/15 px-2">
                  {past.map((ev) => (
                    <ClubEventItem key={ev.id} ev={ev} now={now} past onEdit={(item) => setEditing({ item })} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {tab === "gelismeler" && <ClubNotesTab now={now} />}

      {tab === "gorevler" && (
        <Card title="Kulüp görevleri" icon={<ListTodo size={16} />}>
          {todos !== undefined && clubTodos.length === 0 && <EmptyState text="Açık kulüp görevi yok." />}
          {clubTodos.length > 0 && (
            <ul className="mb-2 divide-y divide-ink-900/15">
              {clubTodos.map((t) => (
                <TodoItem key={t.id} todo={t} now={now} showCategory={false} onEdit={setEditingTodo} />
              ))}
            </ul>
          )}
          <QuickAddTodo category="kulup" placeholder="Kulüp görevi ekle..." />
          <p className="mt-2 text-xs text-ink-500">Bunlar Görevler sekmesinde &quot;Kulüp&quot; kategorisinde de görünür.</p>
        </Card>
      )}

      {editing && <ClubEventFormModal initial={editing.item} onClose={() => setEditing(null)} />}
      {editingTodo && <TodoFormModal initial={editingTodo} onClose={() => setEditingTodo(null)} />}
    </div>
  );
}
