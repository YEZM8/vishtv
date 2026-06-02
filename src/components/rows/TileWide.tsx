import Link from "next/link";
import Image from "next/image";
import { getThumbnailUrl } from "@/lib/youtube";

interface TileWideProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  description?: string;
  programme?: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  href?: string;
  badge?: { text: string; variant?: "live" | "new" | "hd" };
  progress?: number;
  artClass?: string;
}

export default function TileWide({
  title,
  subtitle,
  eyebrow,
  description,
  programme,
  youtubeId,
  thumbnailUrl,
  href = "/watch",
  badge,
  progress,
  artClass,
}: TileWideProps) {
  const imgSrc =
    thumbnailUrl || (youtubeId ? getThumbnailUrl(youtubeId, "high") : null);

  const content = (
    <div className="tile tile-wide">
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 560px) 70vw, (max-width: 1024px) 40vw, 30vw"
          style={{ objectFit: "cover", borderRadius: "var(--r-md)" }}
        />
      ) : (
        <div className={artClass || "art-1"} style={{ position: "absolute", inset: 0, borderRadius: "var(--r-md)" }} />
      )}

      {badge && (
        <span
          className={`tile-badge ${
            badge.variant === "new"
              ? "tile-badge--new"
              : badge.variant === "hd"
              ? "tile-badge--hd"
              : ""
          }`}
        >
          {badge.variant === "live" && (
            <span className="dot" aria-hidden="true" />
          )}
          {badge.text}
        </span>
      )}

      <div className="tile-overlay">
        {eyebrow && <span className="tile-eyebrow">{eyebrow}</span>}
        <span className="tile-title">{title}</span>
        {subtitle && <span className="tile-subtitle">{subtitle}</span>}
      </div>

      {/* Netflix-style hover card */}
      {(description || programme) && (
        <div className="tile-hover-card">
          <div className="tile-hover-title">{title}</div>
          {description && <div className="tile-hover-desc">{description}</div>}
          <div className="tile-hover-meta">
            {programme && <span>{programme}</span>}
            {programme && subtitle && <span>·</span>}
            {subtitle && <span>{subtitle}</span>}
          </div>
          <div className="tile-hover-play">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            Play
          </div>
        </div>
      )}

      {typeof progress === "number" && (
        <div className="tile-progress">
          <div
            className="tile-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={youtubeId ? `/watch/${youtubeId}` : href}>{content}</Link>;
  }
  return content;
}
