"use client";

import { useState } from "react";
import TilePoster from "@/components/rows/TilePoster";
import styles from "./BrowsePage.module.css";

interface Programme {
  _id: string;
  title: string;
  slug: string;
  poster?: { asset: { _ref: string } };
  thumbnail?: { asset: { _ref: string } };
  description?: string;
  categoryTitle?: string;
  categorySlug?: string;
}

interface Category {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
}

interface BrowseGridProps {
  programmes: Programme[];
  categories: Category[];
  posterUrls: Record<string, string>; // _id → resolved poster URL
}

export default function BrowseGrid({ programmes, categories, posterUrls }: BrowseGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? programmes.filter((p) => p.categorySlug === activeCategory)
    : programmes;

  return (
    <>
      {/* Filter Chips */}
      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${!activeCategory ? styles.chipActive : ""}`}
          onClick={() => setActiveCategory(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`${styles.chip} ${activeCategory === cat.slug ? styles.chipActive : ""}`}
            onClick={() => setActiveCategory(cat.slug)}
          >
            {cat.icon && <span>{cat.icon} </span>}
            {cat.title}
          </button>
        ))}
      </div>

      {/* Poster Grid */}
      <div className={styles.grid}>
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <TilePoster
              key={p._id}
              title={p.title}
              subtitle={p.categoryTitle}
              imageSrc={posterUrls[p._id]}
              href={`/browse/${p.slug}`}
            />
          ))
        ) : (
          <p className={styles.empty}>No programmes in this category yet.</p>
        )}
      </div>
    </>
  );
}
