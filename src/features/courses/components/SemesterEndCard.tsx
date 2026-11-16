"use client";
// Program sekmesinde: dönem bitiş tarihi. Bu tarihten sonra dersler takvimde ve Bugün ekranında görünmez.
import { useState } from "react";
import { parseISO } from "date-fns";
import { CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form";
import { formatLong, toISODate } from "@/lib/dates";
import { setSemesterEnd, useSemesterEnd } from "../semester";

export function SemesterEndCard({ now }: { now: Date }) {
  const end = useSemesterEnd();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  if (end === undefined) return null;

  const ended = end !== null && toISODate(now) > end;

  return (
    <Card title="Dönem bitişi" icon={<CalendarOff size={16} />}>
      {editing ? (
        <div className="flex flex-wrap gap-2">
          <Input type="date" value={value} onChange={(e) => setValue(e.target.value)} className="!w-auto flex-1" />
          <Button
            onClick={async () => {
              if (value) await setSemesterEnd(value);
              setEditing(false);
            }}
          >
            Kaydet
          </Button>
          {end && (
            <Button
              variant="secondary"
              onClick={async () => {
                await setSemesterEnd(null);
                setEditing(false);
              }}
            >
              Kaldır
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-ink-700">
            {end ? (
              <>
                {ended ? "Dönem bitti: " : "Dersler "}
                <b className="capitalize">{formatLong(parseISO(end))}</b>
                {ended ? " — dersler takvimde gösterilmiyor." : " tarihine kadar takvimde görünür."}
              </>
            ) : (
              "Bitiş tarihi yok — dersler her hafta görünür."
            )}
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setValue(end ?? toISODate(now));
              setEditing(true);
            }}
          >
            {end ? "Değiştir" : "Ayarla"}
          </Button>
        </div>
      )}
      <p className="mt-2 text-xs text-ink-500">Aktiviteler (ör. Wolves idmanı) bu tarihten etkilenmez.</p>
    </Card>
  );
}
