import { Suspense } from "react";
import { TopActions } from "./top-actions";

export function PageHeader({ title, subtitle, children }: { title: React.ReactNode; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="sp-h1">{title}</h1>
        {subtitle && <p className="mt-1 text-sp-text2">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {children}
        <div className="hidden lg:block">
          <Suspense fallback={<div className="h-11 w-[420px]" />}>
            <TopActions />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
