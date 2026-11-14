import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "@/components/settings-form";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="mt-1 text-ink/60">Company profile, booking rules and notification preferences.</p>
      <div className="mt-8 max-w-5xl">
        <Suspense fallback={<div className="h-[600px] animate-pulse rounded-2xl bg-mist/60" />}>
          <Settings />
        </Suspense>
      </div>
    </>
  );
}

async function Settings() {
  return <SettingsForm settings={await api.supplier.settings()} />;
}
