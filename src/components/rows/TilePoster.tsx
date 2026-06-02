import Link from "next/link";
import Image from "next/image";

interface TilePosterProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  imageSrc?: string;
  href?: string;
  badge?: { text: string; variant?: "live" | "new" | "hd" };
  artClass?: string;
}

export default function TilePoster({
  title,
  subtitle,
  eyebrow,
  imageSrc,
  href = "/browse",
  badge,
  artClass,
}: TilePosterProps) {
  const content = (
    <div className="tile tile-poster">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 560px) 45vw, (max-width: 1024px) 25vw, 18vw"
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
          {badge.text}
        </span>
      )}

      <div className="tile-overlay">
        {eyebrow && <span className="tile-eyebrow">{eyebrow}</span>}
        <span className="tile-title">{title}</span>
        {subtitle && <span className="tile-subtitle">{subtitle}</span>}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
