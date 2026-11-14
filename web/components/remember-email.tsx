"use client";

import { useEffect } from "react";

/** Remembers the guest's email so "My trips" can list bookings without an account. */
export function RememberEmail({ email }: { email: string }) {
  useEffect(() => {
    localStorage.setItem("vt:email", email);
  }, [email]);
  return null;
}
