"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageProvider";
import MobileDrawer from "./MobileDrawer";

interface TopbarProps {
  /** Transparent → solid on scroll (Home hero). Default: always solid. */
  transparent?: boolean;
}

export default function Topbar({ transparent = false }: TopbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { locale, setLocale, t } = useLanguage();

  const NAV_LINKS = [
    { href: "/", label: t("nav.home") },
    { href: "/watch", label: t("nav.watch") },
    { href: "/browse", label: t("nav.browse") },
    { href: "/news", label: t("nav.news") },
    { href: "/radio", label: t("nav.radio") },
    { href: "/events", label: t("nav.events") },
  ];

  useEffect(() => {
    if (!transparent) return;

    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  const className = [
    "topbar",
    !transparent ? "topbar--solid" : "",
    scrolled ? "is-scrolled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={className} id="topbar" ref={headerRef}>
        <div className="topbar-inner">
          <Link className="brand" href="/" aria-label="VishTV home">
            <Image
              className="brand-logo"
              src="/assets/vishvavahini-logo-primary-transparent.png"
              alt="VishTV"
              width={180}
              height={48}
              priority
            />
          </Link>

          <nav className="nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="utility">
            <Link className="icon-btn" href="/search" aria-label="Search">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </Link>

            <button
              className="lang-toggle"
              aria-label={t("language.switchTo")}
              onClick={() => setLocale(locale === "en" ? "si" : "en")}
            >
              {locale === "en" ? <><b>EN</b> / සිං</> : <>EN / <b>සිං</b></>}
            </button>

            <div className="profile-avatar" aria-label="Profile menu">
              V
            </div>

            <button
              className="icon-btn menu-btn"
              aria-label="Open menu"
              aria-controls="mobile-menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        links={NAV_LINKS}
      />
    </>
  );
}
