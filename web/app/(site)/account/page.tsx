import type { Metadata } from "next";
import { MyTrips } from "@/components/my-trips";

export const metadata: Metadata = { title: "My trips" };

export default function AccountPage() {
  return (
    <div className="container-x max-w-5xl py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">My trips</h1>
      <p className="mt-2 text-ink/60">Find, manage and cancel your bookings with the email you booked with. No password needed.</p>
      <MyTrips />
    </div>
  );
}
