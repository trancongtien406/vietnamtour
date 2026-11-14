import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "@/components/settings-form";
import { PageHeader } from "@/components/supplier/page-header";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Company profile, booking rules and notification preferences." />
      <div className="max-w-5xl">
        <Suspense fallback={<div className="h-[600px] animate-pulse rounded-2xl bg-sp-muted" />}>
          <Settings />
        </Suspense>
      </div>
    </div>
  );
}

async function Settings() {
  return <SettingsForm settings={await api.supplier.settings()} />;
}
