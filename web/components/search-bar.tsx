import { SearchIcon } from "./icons";

export function SearchBar({ defaultValue = "", size = "lg" }: { defaultValue?: string; size?: "lg" | "md" }) {
  return (
    <form action="/tours" className={`flex w-full items-center gap-2 rounded-full bg-white p-1.5 shadow-xl shadow-ink/10 ring-1 ring-mist ${size === "lg" ? "max-w-2xl" : ""}`} role="search">
      <SearchIcon className="ml-3 h-5 w-5 text-ink/50" />
      <label htmlFor="q" className="sr-only">Search tours</label>
      <input
        id="q"
        name="q"
        defaultValue={defaultValue}
        placeholder="Where to? Try “Hạ Long”, “food”, “cave”…"
        className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none placeholder:text-ink/45"
      />
      <button className="btn-primary !px-5 !py-2.5">Search</button>
    </form>
  );
}
