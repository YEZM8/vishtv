"use client";

import { useRef } from "react";
import Link from "next/link";
import styles from "./ContentRow.module.css";

interface ContentRowProps {
  title: string;
  moreHref?: string;
  variant?: "default" | "posters" | "wide";
  children: React.ReactNode;
}

export default function ContentRow({
  title,
  moreHref,
  variant = "default",
  children,
}: ContentRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.7;
    track.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const rowClass = [
    "row",
    variant === "posters" ? "row-posters" : "",
    variant === "wide" ? "row-wide" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={`section ${rowClass}`}>
      <div className="section-head">
        <h2>
          {title}
          {moreHref && <span className="more-arrow">&nbsp;&rsaquo;</span>}
        </h2>
        {moreHref && <Link href={moreHref}>See all</Link>}
      </div>

      <div className={styles.wrapper}>
        <button
          className={styles.arrow}
          data-dir="left"
          onClick={() => scroll("left")}
          aria-label={`Scroll ${title} left`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="row-track" ref={trackRef}>
          {children}
        </div>

        <button
          className={styles.arrow}
          data-dir="right"
          onClick={() => scroll("right")}
          aria-label={`Scroll ${title} right`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
