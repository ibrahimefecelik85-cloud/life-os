import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-500 text-ink-50 shadow-sm shadow-black/30 hover:bg-brand-600",
  secondary: "bg-ink-800 text-ink-100 hover:bg-ink-700",
  ghost: "text-ink-400 hover:bg-ink-800 hover:text-ink-100",
  danger: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}

/** Sadece ikondan oluşan küçük buton (ör. düzenle, sil) */
export function IconButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100 ${className}`}
      {...props}
    />
  );
}
