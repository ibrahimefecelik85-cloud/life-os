import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-50">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
