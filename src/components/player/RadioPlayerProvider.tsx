"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import {
  RADIO_ARTWORK,
  RADIO_STATION_FALLBACK,
  type RadioNowPlaying,
} from "@/lib/radio";
import RadioMiniBar from "./RadioMiniBar";

export type RadioStatus =
  | "idle" // nothing started yet
  | "loading" // connecting / buffering
  | "playing" // audio flowing
  | "paused" // user paused
  | "reconnecting" // dropped, backing off before retry
  | "error"; // gave up (only when the user isn't trying to listen)

interface RadioContextValue {
  status: RadioStatus;
  nowPlaying: RadioNowPlaying | null;
  streamUrl: string | null;
  stationName: string;
  volume: number;
  muted: boolean;
  /** True once the user has pressed play at least once (drives the mini-bar). */
  hasStarted: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** Stop playback AND dismiss the persistent mini-bar (back to idle). */
  stop: () => void;
  setVolume: (v: number) => void;
  toggleMuted: () => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export function useRadioPlayer(): RadioContextValue {
  const ctx = useContext(RadioContext);
  if (!ctx) {
    throw new Error("useRadioPlayer must be used within a RadioPlayerProvider");
  }
  return ctx;
}

const MAX_BACKOFF_MS = 15_000;
const POLL_INTERVAL_MS = 12_000;
const VOLUME_KEY = "vishtv:radio:volume";
const MUTED_KEY = "vishtv:radio:muted";

/** Read the saved volume (SSR-safe); defaults to full volume. */
function readStoredVolume(): number {
  if (typeof window === "undefined") return 1;
  try {
    const v = Number(localStorage.getItem(VOLUME_KEY));
    return Number.isNaN(v) || v < 0 || v > 1 ? 1 : v;
  } catch {
    return 1;
  }
}

/** Read the saved mute flag (SSR-safe). */
function readStoredMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

export default function RadioPlayerProvider({
  streamUrl,
  stationName = RADIO_STATION_FALLBACK,
  children,
}: {
  streamUrl: string | null;
  stationName?: string;
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Intent flag: distinguishes "the user wants to listen" from a user pause,
  // so the reconnect watchdog never fights a deliberate pause.
  const wantPlayingRef = useRef(false);
  const retryRef = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stall detection: we only reconnect when the playback position stops
  // advancing, not on the noisy `stalled` event (which fires during normal
  // buffering and would otherwise cause a reconnect loop).
  const lastTimeRef = useRef(0);
  const lastAdvanceRef = useRef(0);

  const [status, setStatus] = useState<RadioStatus>("idle");
  const [nowPlaying, setNowPlaying] = useState<RadioNowPlaying | null>(null);
  // Lazy-init from the listener's saved preference (guarded for SSR). This
  // avoids a setState-in-effect and hydrates at the right value immediately.
  const [volume, setVolumeState] = useState<number>(() => readStoredVolume());
  const [muted, setMuted] = useState<boolean>(() => readStoredMuted());
  const [hasStarted, setHasStarted] = useState(false);

  // --- Playback control -----------------------------------------------------

  const openConnection = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;
    // Cache-bust so every (re)connect opens a genuinely fresh stream rather than
    // resuming a stale buffer — a live radio stream should never replay old audio.
    const bust = `${streamUrl.includes("?") ? "&" : "?"}_=${Date.now()}`;
    audio.src = `${streamUrl}${bust}`;
    // Reset the stall clock so the watchdog gives this fresh connection time to
    // buffer before considering it stalled.
    lastTimeRef.current = 0;
    lastAdvanceRef.current = Date.now();
    audio.load();
    audio.play().catch(() => {
      // Autoplay/gesture rejections surface via the audio events below.
    });
  }, [streamUrl]);

  const clearReconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!wantPlayingRef.current) return;
    clearReconnect();
    const delay = Math.min(1000 * 2 ** retryRef.current, MAX_BACKOFF_MS);
    retryRef.current += 1;
    setStatus("reconnecting");
    reconnectTimer.current = setTimeout(() => {
      if (wantPlayingRef.current) openConnection();
    }, delay);
  }, [clearReconnect, openConnection]);

  const play = useCallback(() => {
    if (!streamUrl) return;
    wantPlayingRef.current = true;
    retryRef.current = 0;
    clearReconnect();
    setHasStarted(true);
    setStatus("loading");
    openConnection();
  }, [streamUrl, clearReconnect, openConnection]);

  const pause = useCallback(() => {
    wantPlayingRef.current = false;
    clearReconnect();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      // Drop the source so a paused live stream stops downloading in the background.
      audio.removeAttribute("src");
      audio.load();
    }
    setStatus("paused");
  }, [clearReconnect]);

  const toggle = useCallback(() => {
    if (wantPlayingRef.current) pause();
    else play();
  }, [pause, play]);

  const stop = useCallback(() => {
    pause();
    setHasStarted(false); // dismiss the mini-bar
  }, [pause]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    if (clamped > 0) setMuted(false);
  }, []);

  const toggleMuted = useCallback(() => setMuted((m) => !m), []);

  // --- Audio element event wiring (resilience) ------------------------------

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const markAdvance = () => {
      lastTimeRef.current = audio.currentTime;
      lastAdvanceRef.current = Date.now();
    };
    const onPlaying = () => {
      retryRef.current = 0;
      clearReconnect();
      markAdvance();
      setStatus("playing");
    };
    const onProgress = () => {
      if (audio.currentTime > lastTimeRef.current) markAdvance();
    };
    const onWaiting = () => {
      // Buffering — surface it, but let the stall watchdog decide on reconnects.
      if (wantPlayingRef.current) setStatus("loading");
    };
    const onFailure = () => {
      // Hard failures only: network error, or a live stream that "ended".
      // `stalled` is deliberately NOT wired here — it fires during normal
      // buffering and the watchdog covers genuine drops.
      if (wantPlayingRef.current) scheduleReconnect();
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("timeupdate", onProgress);
    audio.addEventListener("progress", onProgress);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onFailure);
    audio.addEventListener("ended", onFailure);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("timeupdate", onProgress);
      audio.removeEventListener("progress", onProgress);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onFailure);
      audio.removeEventListener("ended", onFailure);
    };
  }, [clearReconnect, scheduleReconnect]);

  // Stall watchdog: if we intend to play but the position hasn't advanced for a
  // while, the stream has silently dropped — reconnect. Replaces reacting to the
  // noisy `stalled` event.
  useEffect(() => {
    const STALL_MS = 12_000;
    const id = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || !wantPlayingRef.current || audio.paused) return;
      if (reconnectTimer.current) return; // a reconnect is already pending
      if (audio.currentTime > lastTimeRef.current) {
        lastTimeRef.current = audio.currentTime;
        lastAdvanceRef.current = Date.now();
        return;
      }
      if (Date.now() - lastAdvanceRef.current > STALL_MS) {
        scheduleReconnect();
      }
    }, 4000);
    return () => clearInterval(id);
  }, [scheduleReconnect]);

  // Keep the element's volume/mute in sync with state.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = muted;
    }
  }, [volume, muted]);

  // Persist volume/mute whenever they change (initial values come from the
  // lazy initializers above, so no restore effect is needed).
  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
      localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
    } catch {
      // localStorage unavailable (private mode) — ignore.
    }
  }, [volume, muted]);

  // Clear any pending reconnect timer on unmount.
  useEffect(() => clearReconnect, [clearReconnect]);

  // --- Now-playing polling --------------------------------------------------

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/nowplaying", { cache: "no-store" });
        if (!res.ok) return;
        const data: RadioNowPlaying = await res.json();
        if (active) setNowPlaying(data);
      } catch {
        // Transient metadata failures never affect playback — ignore.
      }
    };
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // --- Media Session (lock-screen / OS / Bluetooth controls) ----------------

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowPlaying?.title || stationName,
      artist: nowPlaying?.artist || stationName,
      album: stationName,
      artwork: RADIO_ARTWORK,
    });
  }, [nowPlaying, stationName]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.setActionHandler("play", () => play());
    ms.setActionHandler("pause", () => pause());
    ms.setActionHandler("stop", () => pause());
    // Radio is live — remove scrub/skip controls so the OS doesn't offer them.
    for (const action of ["seekbackward", "seekforward", "previoustrack", "nexttrack"] as const) {
      try {
        ms.setActionHandler(action, null);
      } catch {
        // Some browsers throw on unsupported actions — safe to ignore.
      }
    }
    ms.playbackState =
      status === "playing" ? "playing" : hasStarted ? "paused" : "none";

    return () => {
      try {
        ms.setActionHandler("play", null);
        ms.setActionHandler("pause", null);
        ms.setActionHandler("stop", null);
      } catch {
        // ignore
      }
    };
  }, [play, pause, status, hasStarted]);

  const value: RadioContextValue = {
    status,
    nowPlaying,
    streamUrl,
    stationName,
    volume,
    muted,
    hasStarted,
    play,
    pause,
    toggle,
    stop,
    setVolume,
    toggleMuted,
  };

  return (
    <RadioContext.Provider value={value}>
      {children}
      {/*
        The single audio element for the whole app. It lives in the root layout
        (via this provider), so it never unmounts on navigation and playback
        continues seamlessly across routes. preload="none" keeps it idle until
        the user presses play.
      */}
      <audio ref={audioRef} preload="none" />
      <RadioMiniBar />
    </RadioContext.Provider>
  );
}
