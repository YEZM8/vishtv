"use client";

import { PortableText } from "@portabletext/react";
import type { PortableTextReactComponents } from "@portabletext/react";
import { urlFor } from "@/sanity/client";
import { getEmbedUrl } from "@/lib/youtube";
import styles from "./PortableTextBody.module.css";

const components: Partial<PortableTextReactComponents> = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const url = urlFor(value).width(800).url();
      return (
        <figure>
          <img
            className={styles.inlineImage}
            src={url}
            alt={value.alt || ""}
            loading="lazy"
          />
          {value.caption && (
            <figcaption className={styles.imageCaption}>
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    youtubeEmbed: ({ value }) => {
      if (!value?.videoId) return null;
      return (
        <div className={styles.videoEmbed}>
          <iframe
            src={getEmbedUrl(value.videoId)}
            title="Embedded video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    },
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
};

interface PortableTextBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[];
}

export default function PortableTextBody({ value }: PortableTextBodyProps) {
  return (
    <div className={styles.prose}>
      <PortableText value={value} components={components} />
    </div>
  );
}
