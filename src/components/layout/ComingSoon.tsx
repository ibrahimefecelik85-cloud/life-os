import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader";

/** Henüz yapılmamış modüller için geçici sayfa */
export function ComingSoon({ title, icon, stage }: { title: string; icon: ReactNode; stage: number }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">
        {icon}
        <p className="text-sm">Bu modül Aşama {stage}&apos;de eklenecek.</p>
      </div>
    </>
  );
}
