import type { Metadata } from "next";
import Image from "next/image";
import { client, urlFor } from "@/sanity/client";
import { eventsQuery } from "@/lib/queries";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import styles from "./EventsPage.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming events from the VishTV community.",
};

export default async function EventsPage() {
  const events = await client.fetch(eventsQuery);

  return (
    <>
      <Topbar />

      <main id="main-content">
        <div className={styles.header}>
          <h1 className={styles.heading}>Events</h1>
        </div>

        <div className={styles.grid}>
          {events && events.length > 0 ? (
            events.map(
              (event: {
                _id: string;
                title: string;
                image?: { asset: { _ref: string } };
                date?: string;
                description?: string;
                ticketUrl?: string;
              }) => (
                <div key={event._id} className={styles.card}>
                  <div className={styles.cardImage}>
                    {event.image?.asset && (
                      <Image
                        src={urlFor(event.image).width(600).height(340).url()}
                        alt={event.title}
                        fill
                        sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    {event.date && (
                      <div className={styles.cardDate}>
                        {new Date(event.date).toLocaleDateString("en-AU", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    )}
                    <h2 className={styles.cardTitle}>{event.title}</h2>
                    {event.description && (
                      <p className={styles.cardDescription}>{event.description}</p>
                    )}
                    {event.ticketUrl && (
                      <a
                        className="btn btn-brand"
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get tickets
                      </a>
                    )}
                  </div>
                </div>
              )
            )
          ) : (
            <p className={styles.empty}>No upcoming events. Check back soon.</p>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
