"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, api } from "./api";
import type { FieldErrors } from "./types";

export type FormState = { message?: string; errors?: FieldErrors; values?: Record<string, string> };

const values = (fd: FormData) =>
  Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;

export async function createBookingAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  let code: string;
  try {
    const booking = await api.createBooking({
      tourSlug: v.tourSlug,
      date: v.date,
      time: v.time,
      adults: Number(v.adults),
      children: Number(v.children || 0),
      fullName: v.fullName,
      email: v.email,
      phone: v.phone,
      note: v.note,
    });
    code = booking.code;
  } catch (e) {
    if (e instanceof ApiError) return { message: e.message, errors: e.errors, values: v };
    throw e;
  }
  redirect(`/booking/${code}/pay`);
}

export async function payAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  try {
    await api.pay(v.code, { cardNumber: v.cardNumber, expiry: v.expiry, cvc: v.cvc, name: v.name });
  } catch (e) {
    if (e instanceof ApiError) return { message: e.message, errors: e.errors, values: v };
    throw e;
  }
  redirect(`/booking/${v.code}?paid=1`);
}

export async function cancelBookingAction(fd: FormData) {
  const code = String(fd.get("code"));
  await api.cancel(code);
  revalidatePath(`/booking/${code}`);
}

export async function supplierBookingAction(fd: FormData) {
  await api.supplier.act(String(fd.get("code")), String(fd.get("action")));
  revalidatePath("/supplier", "layout");
}

export async function updateProductAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  try {
    await api.supplier.updateProduct(v.slug, {
      title: v.title,
      priceUsd: Number(v.priceUsd),
      maxGroupSize: Number(v.maxGroupSize),
      startTimes: v.startTimes.split(",").map((s) => s.trim()).filter(Boolean),
      published: fd.get("published") === "on",
    });
  } catch (e) {
    if (e instanceof ApiError) return { message: e.message, errors: e.errors, values: v };
    throw e;
  }
  revalidatePath("/supplier", "layout");
  return { message: "Saved. Changes are live on the website." };
}

export async function replyReviewAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  try {
    await api.supplier.reply(v.id, v.text ?? "");
  } catch (e) {
    if (e instanceof ApiError) return { message: e.message, errors: e.errors, values: v };
    throw e;
  }
  revalidatePath("/supplier/reviews");
  return { message: "Reply published" };
}

export async function updateSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  try {
    await api.supplier.updateSettings({
      companyName: v.companyName,
      legalName: v.legalName,
      licenseNo: v.licenseNo,
      address: v.address,
      email: v.email,
      phone: v.phone,
      website: v.website,
      languages: v.languages,
      cutoffHours: v.cutoffHours,
      notifications: {
        newBooking: fd.has("newBooking"),
        cancellation: fd.has("cancellation"),
        newReview: fd.has("newReview"),
        dailySummary: fd.has("dailySummary"),
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return { message: e.message, errors: e.errors, values: v };
    throw e;
  }
  revalidatePath("/supplier/settings");
  return { message: "Settings saved" };
}

export async function requestPayoutAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  try {
    await api.supplier.requestPayout(Number(v.amountUsd));
  } catch (e) {
    if (e instanceof ApiError) return { message: e.message, errors: e.errors, values: v };
    throw e;
  }
  revalidatePath("/supplier/finance");
  return { message: "Payout requested. Funds usually arrive within 2 business days." };
}
