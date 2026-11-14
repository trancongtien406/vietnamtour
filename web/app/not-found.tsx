import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="font-display text-6xl font-bold text-lotus">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold">We couldn’t find that page</h1>
      <p className="mt-2 text-ink/60">The tour or booking may have moved. Let’s get you back on the road.</p>
      <Link href="/tours" className="btn-primary mt-8">Browse experiences</Link>
    </div>
  );
}
