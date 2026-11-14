import type { InputHTMLAttributes } from "react";

export function Field({ label, error, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold">{label}</span>
      <input {...props} aria-invalid={Boolean(error)} className={`input mt-1.5 ${error ? "!border-red-400" : ""}`} />
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}
