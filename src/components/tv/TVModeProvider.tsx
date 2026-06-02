"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import useDPadNavigation from "@/hooks/useDPadNavigation";

interface TVModeContextValue {
  tvMode: boolean;
  setTvMode: (on: boolean) => void;
}

const TVModeContext = createContext<TVModeContextValue>({
  tvMode: false,
  setTvMode: () => {},
});

export function useTVMode() {
  return useContext(TVModeContext);
}

export default function TVModeProvider({ children }: { children: ReactNode }) {
  const [tvMode, setTvMode] = useState(false);

  // Detect ?tv=1 query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tv") === "1") {
      setTvMode(true);
    }
  }, []);

  // Toggle html.tv class
  useEffect(() => {
    document.documentElement.classList.toggle("tv", tvMode);
  }, [tvMode]);

  // Enable D-pad navigation in TV mode
  useDPadNavigation(tvMode);

  return (
    <TVModeContext.Provider value={{ tvMode, setTvMode }}>
      {children}
    </TVModeContext.Provider>
  );
}
