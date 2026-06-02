import type { Metadata } from "next";
import Image from "next/image";
import { client, urlFor } from "@/sanity/client";
import { articleQuery } from "@/lib/queries";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import PortableTextBody from "@/components/content/PortableTextBody";
import styles from "./ArticlePage.module.css";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await client.fetch(articleQuery, { slug });

  if (!article) return { title: "Article not found" };

  const title = article.title;
  const description = article.body
    ? `${article.title} — VishTV News`
    : "Read on VishTV";
  const image = article.featuredImage?.asset
    ? urlFor(article.featuredImage).width(1200).height(630).url()
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await client.fetch(articleQuery, { slug });

  if (!article) {
    return (
      <>
        <Topbar />
        <main id="main-content">
          <p className={styles.notFound}>Article not found.</p>
        </main>
        <Footer />
      </>
    );
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <Topbar />

      <main id="main-content">
        {article.featuredImage?.asset && (
          <div className={styles.hero}>
            <Image
              src={urlFor(article.featuredImage).width(1400).height(600).url()}
              alt={article.title}
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        )}

        <article className={styles.article}>
          {article.categoryTitle && (
            <div className={styles.category}>{article.categoryTitle}</div>
          )}
          <h1 className={styles.title}>{article.title}</h1>
          <div className={styles.meta}>
            {article.author && <span>By {article.author}</span>}
            {article.author && formattedDate && " · "}
            {formattedDate && <span>{formattedDate}</span>}
          </div>

          {article.body && <PortableTextBody value={article.body} />}
        </article>
      </main>

      <Footer />
    </>
  );
}
