"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import styles from "./MobileDrawer.module.css";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
}

export default function MobileDrawer({
  open,
  onClose,
  links,
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { locale, setLocale, t } = useLanguage();

  // Focus trap + ESC handling
  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.open : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        id="mobile-menu"
        className={`${styles.drawer} ${open ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={styles.header}>
          <span className={styles.title}>Menu</span>
          <button
            ref={closeRef}
            className={styles.close}
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.link}
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          <button
            className={styles.langBtn}
            aria-label={t("language.switchTo")}
            onClick={() => setLocale(locale === "en" ? "si" : "en")}
          >
            {locale === "en" ? <><b>EN</b> / සිං</> : <>EN / <b>සිං</b></>}
          </button>
        </div>
      </div>
    </>
  );
}
