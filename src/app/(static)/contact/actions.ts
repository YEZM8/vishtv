"use server";

import { writeClient } from "@/sanity/write-client";

export type ContactState = { ok: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  // Honeypot — bots fill hidden fields; humans never see it.
  const honeypot = String(formData.get("company") || "").trim();

  if (honeypot) return { ok: true }; // silently drop bots

  if (!name || !email || !message) {
    return { ok: false, error: "Please fill in your name, email and message." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Your message is too long (max 5000 characters)." };
  }

  try {
    await writeClient.create({
      _type: "contactMessage",
      name,
      email,
      ...(subject ? { subject } : {}),
      message,
      submittedAt: new Date().toISOString(),
      isRead: false,
    });
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Something went wrong sending your message. Please try again, or email us directly.",
    };
  }
}
