import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, icon, action, children, className = "" }: CardProps) {
  return (
    <section className={`rounded-2xl border border-ink-800 bg-ink-900/60 p-4 ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-300">
            {icon}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
