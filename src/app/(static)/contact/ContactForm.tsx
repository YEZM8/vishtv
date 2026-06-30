"use client";

import { useActionState } from "react";
import type { CSSProperties } from "react";
import { submitContact, type ContactState } from "./actions";

const initialState: ContactState = { ok: false };

const label: CSSProperties = {
  display: "block",
  fontSize: "var(--fs--1)",
  fontWeight: 600,
  color: "var(--text)",
  marginBottom: "var(--sp-1)",
};
const field: CSSProperties = {
  width: "100%",
  padding: "var(--sp-3) var(--sp-4)",
  background: "var(--bg-1, #0d0d12)",
  border: "1px solid var(--line-2)",
  borderRadius: "var(--r-md)",
  color: "var(--text)",
  fontSize: "var(--fs-0)",
  marginBottom: "var(--sp-4)",
};

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  if (state.ok) {
    return (
      <div
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-md)",
          padding: "var(--sp-6)",
          color: "var(--text-muted)",
        }}
      >
        <h2 style={{ fontSize: "var(--fs-2)", fontWeight: 600, color: "var(--text)", marginBottom: "var(--sp-2)" }}>
          Thanks for getting in touch!
        </h2>
        <p style={{ fontSize: "var(--fs-0)" }}>
          We&apos;ve received your message and will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-md)",
        padding: "var(--sp-6)",
      }}
    >
      <h2 style={{ fontSize: "var(--fs-2)", fontWeight: 600, color: "var(--text)", marginBottom: "var(--sp-4)" }}>
        Send us a message
      </h2>

      {/* Honeypot — visually hidden, off accessibility tree */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--sp-4)" }}>
        <div>
          <label style={label} htmlFor="cf-name">Name</label>
          <input style={field} id="cf-name" name="name" type="text" required maxLength={120} />
        </div>
        <div>
          <label style={label} htmlFor="cf-email">Email</label>
          <input style={field} id="cf-email" name="email" type="email" required maxLength={200} />
        </div>
      </div>

      <label style={label} htmlFor="cf-subject">Subject (optional)</label>
      <input style={field} id="cf-subject" name="subject" type="text" maxLength={200} />

      <label style={label} htmlFor="cf-message">Message</label>
      <textarea style={{ ...field, resize: "vertical" }} id="cf-message" name="message" rows={6} required maxLength={5000} />

      {state.error && (
        <p style={{ color: "var(--red, #ff5a5a)", fontSize: "var(--fs--1)", marginBottom: "var(--sp-3)" }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          padding: "var(--sp-3) var(--sp-6)",
          background: "var(--blue)",
          border: "1px solid var(--blue)",
          borderRadius: "var(--r-md)",
          color: "#fff",
          fontSize: "var(--fs-0)",
          fontWeight: 600,
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
