"use client";
// Açılır pencere. Telefonda alttan kayan bir panel, geniş ekranda ortada kutu.
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  // Açıkken: arka plan kaymasın, Esc tuşu kapatsın
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-ink-800 bg-ink-900 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <IconButton onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
