// Küçük yardımcı bileşenler
import type { ReactNode } from "react";
import { Check } from "lucide-react";

/** Yuvarlak "tamamlandı" işareti */
export function CheckCircle({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        checked ? "border-brand-300 bg-brand-300 text-ink-950" : "border-ink-600 hover:border-ink-400"
      }`}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </button>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, text, action }: { icon?: ReactNode; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-ink-500">
      {icon}
      <p>{text}</p>
      {action}
    </div>
  );
}

/** Sayfa içi sekmeler (ör. Dersler sayfasında "Bu Hafta / Program / ...") */
export function Tabs<T extends string>({
  value,
  tabs,
  onChange,
}: {
  value: T;
  tabs: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-4 flex gap-1 rounded-xl bg-ink-900 p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`h-9 flex-1 rounded-lg text-sm font-medium transition-colors ${
            value === t.value ? "bg-ink-800 text-ink-100" : "text-ink-500 hover:text-ink-300"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
