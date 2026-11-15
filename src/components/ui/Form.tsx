// Form alanları: etiket + giriş kutusu. Hepsi aynı görünsün diye tek yerde.
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-xl border border-ink-800 bg-ink-950 px-3 text-base text-ink-100 placeholder:text-ink-600 outline-none focus:border-brand-500";

/**
 * Etiketli form alanı. Tek bir giriş kutusu için <label> kullanır (etikete dokununca kutu seçilir).
 * Buton grupları için `group` ver: o zaman <label> yerine <div role="group"> kullanılır,
 * yoksa etikete dokunmak gruptaki ilk butona tıklamış gibi olur.
 */
export function Field({ label, group, children }: { label: string; group?: boolean; children: ReactNode }) {
  const caption = <span className="block text-xs font-medium text-ink-400">{label}</span>;
  if (group) {
    return (
      <div role="group" aria-label={label} className="space-y-1.5">
        {caption}
        {children}
      </div>
    );
  }
  return (
    <label className="block space-y-1.5">
      {caption}
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${base} h-11 ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${base} h-11 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${base} min-h-20 py-2.5 ${className}`} {...props} />;
}

/** Birkaç seçenekten birini seçmek için yan yana butonlar (ör. öncelik) */
export function ChoiceGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`h-9 rounded-lg px-3 text-sm transition-colors ${
            value === o.value
              ? "bg-brand-500 text-ink-50"
              : "bg-ink-800 text-ink-300 hover:bg-ink-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
