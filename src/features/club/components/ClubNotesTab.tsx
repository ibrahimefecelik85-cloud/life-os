"use client";
// Gelişmeler: kulüpte olup bitenlerin tarihli kaydı (duyuru, karar, not, sorun)
import { useState, type FormEvent } from "react";
import { Megaphone, Pin, PinOff, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceGroup, Textarea } from "@/components/ui/Form";
import { Badge, EmptyState } from "@/components/ui/misc";
import { formatShort, toISODate } from "@/lib/dates";
import { CLUB_NOTE_LABELS, CLUB_NOTE_STYLES } from "@/lib/labels";
import type { ClubNoteTag } from "@/types";
import { addClubNote, deleteClubNote, togglePinClubNote } from "../api";
import { useClubNotes } from "../hooks";

const TAGS = (Object.keys(CLUB_NOTE_LABELS) as ClubNoteTag[]).map((k) => ({ value: k, label: CLUB_NOTE_LABELS[k] }));
type Filter = "tumu" | ClubNoteTag;

export function ClubNotesTab({ now }: { now: Date }) {
  const notes = useClubNotes();
  const [text, setText] = useState("");
  const [tag, setTag] = useState<ClubNoteTag>("not");
  const [filter, setFilter] = useState<Filter>("tumu");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await addClubNote({ text: text.trim(), tag, date: toISODate(now) });
    setText("");
  }

  const list = (notes ?? []).filter((n) => filter === "tumu" || n.tag === filter);

  return (
    <div className="space-y-4">
      <Card title="Yeni gelişme">
        <form onSubmit={handleAdd} className="space-y-3">
          <ChoiceGroup value={tag} options={TAGS} onChange={setTag} />
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="ör. Salon saatleri değişti, yeni sezon kayıtları başladı..." />
          <Button type="submit" className="w-full" disabled={!text.trim()}>
            Ekle
          </Button>
        </form>
      </Card>

      <ChoiceGroup value={filter} options={[{ value: "tumu" as Filter, label: "Tümü" }, ...TAGS]} onChange={setFilter} />

      <Card>
        {notes === undefined ? null : list.length === 0 ? (
          <EmptyState icon={<Megaphone size={28} />} text="Henüz kayıt yok." />
        ) : (
          <ul className="divide-y divide-ink-900/15">
            {list.map((n) => (
              <li key={n.id} className="flex items-start gap-2 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Badge className={CLUB_NOTE_STYLES[n.tag]}>{CLUB_NOTE_LABELS[n.tag]}</Badge>
                    <span className="text-xs text-ink-500">{formatShort(n.date)}</span>
                    {n.pinned && <Pin size={12} className="text-brand-700" aria-label="Sabitlendi" />}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{n.text}</p>
                </div>
                <IconButton onClick={() => togglePinClubNote(n)} aria-label={n.pinned ? "Sabitlemeyi kaldır" : "Sabitle"} className="shrink-0">
                  {n.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                </IconButton>
                <IconButton
                  onClick={() => confirm("Bu kayıt silinsin mi?") && deleteClubNote(n.id)}
                  aria-label="Sil"
                  className="shrink-0 hover:!text-rose-700"
                >
                  <Trash2 size={15} />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
