"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget article view beacon. Counts once per browser session per article
 * (sessionStorage guard) to avoid inflating on reloads.
 */
export default function TrackView({ id }: { id: string }) {
  useEffect(() => {
    if (!id) return;
    const key = `viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable (private mode) — still count once per mount
    }
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      keepalive: true,
    }).catch(() => {});
  }, [id]);

  return null;
}
