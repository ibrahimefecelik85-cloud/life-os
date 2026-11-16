"use client";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { parseAmount } from "@/lib/money";
import { setMonthlyLimit } from "../api";

export function LimitModal({ current, onClose }: { current: number | null; onClose: () => void }) {
  const [value, setValue] = useState(current ? String(current).replace(".", ",") : "");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const n = parseAmount(value);
    if (n === null) return setError("Geçerli bir tutar yaz.");
    await setMonthlyLimit(n);
    onClose();
  }

  async function handleClear() {
    await setMonthlyLimit(null);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Aylık bütçe limiti">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-ink-600">Her ay için harcama hedefin. Limite yaklaşınca ve aşınca uyarı görürsün.</p>
        <Field label="Limit (₺)">
          <Input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" placeholder="ör. 6000" autoFocus />
        </Field>
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <div className="flex gap-2 pt-2">
          {current && (
            <Button variant="secondary" onClick={handleClear}>
              Limiti kaldır
            </Button>
          )}
          <Button type="submit" className="flex-1">
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
