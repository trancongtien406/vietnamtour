"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const AXIS = { fontSize: 12, fill: "#929B95" };
const money = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v}`);
const full = (v: unknown) => `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const short = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`;

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-sp-border bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-sp-text">{label ? short(label) : ""}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-sp-text2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="sp-num font-semibold text-sp-text">{full(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function RevenueChart({ data }: { data: { day: string; grossUsd: number }[] }) {
  return (
    <div className="h-[240px] w-full" role="img" aria-label="Gross revenue per day, last 14 days">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#EEE9E0" />
          <XAxis dataKey="day" tickFormatter={(d: string) => d.slice(8)} tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={money} tick={AXIS} axisLine={false} tickLine={false} width={52} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(13,91,76,.06)" }} />
          <Bar dataKey="grossUsd" name="Gross revenue" fill="#2F7A68" radius={[5, 5, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EarningsChart({ data }: { data: { day: string; grossUsd: number; netUsd: number }[] }) {
  return (
    <div className="h-[260px] w-full" role="img" aria-label="Net earnings and gross revenue per day">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke="#EEE9E0" />
          <XAxis dataKey="day" tickFormatter={short} tick={AXIS} axisLine={false} tickLine={false} interval={2} minTickGap={8} />
          <YAxis tickFormatter={money} tick={AXIS} axisLine={false} tickLine={false} width={52} domain={[0, "auto"]} allowDataOverflow />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(13,91,76,.06)" }} />
          <Legend verticalAlign="top" align="right" iconType="circle" iconSize={9} height={30} wrapperStyle={{ fontSize: 13, top: -42 }} formatter={(v) => <span style={{ color: "#4F5D57" }}>{v}</span>} />
          <Bar dataKey="netUsd" name="Net earnings" fill="#0D5B4C" radius={[5, 5, 0, 0]} maxBarSize={12} />
          <Bar dataKey="grossUsd" name="Gross revenue" fill="#B9DDD0" radius={[5, 5, 0, 0]} maxBarSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
