import type { InputHTMLAttributes } from "react";

export function Field({
  label,
  error,
  className = "",
  sp = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; sp?: boolean }) {
  return (
    <label className={`block ${className}`}>
      <span className={sp ? "text-[13px] font-semibold text-sp-text" : "text-sm font-semibold"}>{label}</span>
      <input {...props} aria-invalid={Boolean(error)} className={`${sp ? "sp-input" : "input"} mt-1.5 ${error ? "!border-red-400" : ""}`} />
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}
