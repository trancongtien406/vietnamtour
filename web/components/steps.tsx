export function Steps({ current }: { current: number }) {
  const steps = ["Choose", "Your details", "Payment", "Voucher"];
  return (
    <ol className="mb-8 flex items-center gap-2 text-sm">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${i <= current ? "bg-jade text-white" : "bg-mist text-ink/50"}`}>{i + 1}</span>
          <span className={`hidden sm:inline ${i === current ? "font-semibold" : "text-ink/55"}`}>{s}</span>
          {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-mist sm:w-10" />}
        </li>
      ))}
    </ol>
  );
}
