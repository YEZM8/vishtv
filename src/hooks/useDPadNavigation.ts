"use client";

import { useEffect } from "react";

/**
 * D-pad / arrow key navigation for TV mode.
 * Moves focus between elements with [data-focusable] or standard
 * interactive elements (a, button, input, [tabindex]).
 */
export default function useDPadNavigation(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const getFocusable = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"]), [data-focusable]'
        )
      ).filter((el) => el.offsetParent !== null); // visible only

    const onKeyDown = (e: KeyboardEvent) => {
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const current = document.activeElement as HTMLElement;
      const idx = focusable.indexOf(current);

      let next: HTMLElement | null = null;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          next = focusable[(idx + 1) % focusable.length];
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          next = focusable[(idx - 1 + focusable.length) % focusable.length];
          break;
        case "Enter":
          if (current && current !== document.body) {
            current.click();
          }
          return;
        default:
          return;
      }

      if (next) {
        next.focus();
        next.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
