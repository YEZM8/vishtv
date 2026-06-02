import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { client, urlFor } from "@/sanity/client";
import { newsListQuery } from "@/lib/queries";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import styles from "./NewsPage.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "News",
  description: "Latest news from VishTV — Sri Lankan community news from Australia.",
};

export default async function NewsPage() {
  const articles = await client.fetch(newsListQuery, { start: 0, end: 20 });

  return (
    <>
      <Topbar />

      <main id="main-content">
        <div className={styles.header}>
          <h1 className={styles.heading}>News</h1>
        </div>

        <div className={styles.grid}>
          {articles && articles.length > 0 ? (
            articles.map(
              (article: {
                _id: string;
                title: string;
                slug: string;
                featuredImage?: { asset: { _ref: string } };
                publishedAt?: string;
                categoryTitle?: string;
                excerpt?: string;
              }) => (
                <Link
                  key={article._id}
                  href={`/news/${article.slug}`}
                  className={styles.card}
                >
                  <div className={styles.cardImage}>
                    {article.featuredImage?.asset && (
                      <Image
                        src={urlFor(article.featuredImage).width(600).height(340).url()}
                        alt={article.title}
                        fill
                        sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    {article.categoryTitle && (
                      <div className={styles.cardCategory}>{article.categoryTitle}</div>
                    )}
                    <h2 className={styles.cardTitle}>{article.title}</h2>
                    {article.excerpt && (
                      <p className={styles.cardExcerpt}>{article.excerpt}</p>
                    )}
                    {article.publishedAt && (
                      <div className={styles.cardMeta}>
                        {new Date(article.publishedAt).toLocaleDateString("en-AU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                </Link>
              )
            )
          ) : (
            <p className={styles.empty}>No articles yet. Check back soon.</p>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
