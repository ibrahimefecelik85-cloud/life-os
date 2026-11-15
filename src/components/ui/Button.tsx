import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink-900 text-white hover:bg-ink-700",
  secondary: "border border-ink-200 bg-white text-ink-900 hover:bg-ink-100",
  ghost: "text-ink-600 hover:bg-ink-200 hover:text-ink-900",
  danger: "bg-rose-500/15 text-rose-700 hover:bg-rose-500/25",
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
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-200 hover:text-ink-900 ${className}`}
      {...props}
    />
  );
}
