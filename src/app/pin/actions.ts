"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PIN_COOKIE, pinToken } from "@/lib/pin";

export async function enterPin(_prev: string | null, form: FormData): Promise<string | null> {
  const pin = process.env.CHOIR_PIN;
  const entered = String(form.get("pin") ?? "").trim();
  const next = String(form.get("next") ?? "/");

  if (!pin || entered !== pin) {
    // Slow down guessing
    await new Promise((r) => setTimeout(r, 800));
    return "That PIN isn't right. Check the choir WhatsApp group.";
  }

  (await cookies()).set(PIN_COOKIE, await pinToken(pin), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
