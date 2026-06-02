import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with VishTV — enquiries, feedback and advertising.",
};

export default async function ContactPage() {
  const settings = await client.fetch(siteSettingsQuery);

  const email = settings?.contactEmail;
  const phone = settings?.contactPhone;
  const facebook = settings?.socialLinks?.facebook;
  const youtube = settings?.socialLinks?.youtube;

  return (
    <>
      <Topbar />

      <main id="main-content">
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "calc(var(--sp-8) + 60px) var(--safe) var(--sp-8)",
        }}>
          <h1 style={{ fontSize: "var(--fs-4)", fontWeight: 700, marginBottom: "var(--sp-3)" }}>
            Contact Us
          </h1>
          <p style={{
            fontSize: "var(--fs-1)",
            color: "var(--text-muted)",
            marginBottom: "var(--sp-6)",
            lineHeight: 1.5,
          }}>
            We&apos;d love to hear from you. Reach out for enquiries,
            feedback, advertising or collaboration.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "var(--sp-5)",
            marginBottom: "var(--sp-6)",
          }}>
            {/* Email */}
            {email && (
              <div style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-md)",
                padding: "var(--sp-5)",
              }}>
                <h2 style={{ fontSize: "var(--fs-1)", fontWeight: 600, color: "var(--text)", marginBottom: "var(--sp-2)" }}>
                  Email
                </h2>
                <a
                  href={`mailto:${email}`}
                  style={{ color: "var(--blue)", fontSize: "var(--fs-0)", textDecoration: "none" }}
                >
                  {email}
                </a>
              </div>
            )}

            {/* Phone */}
            {phone && (
              <div style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-md)",
                padding: "var(--sp-5)",
              }}>
                <h2 style={{ fontSize: "var(--fs-1)", fontWeight: 600, color: "var(--text)", marginBottom: "var(--sp-2)" }}>
                  Phone
                </h2>
                <a
                  href={`tel:${phone}`}
                  style={{ color: "var(--blue)", fontSize: "var(--fs-0)", textDecoration: "none" }}
                >
                  {phone}
                </a>
              </div>
            )}

            {/* Social */}
            {(facebook || youtube) && (
              <div style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-md)",
                padding: "var(--sp-5)",
              }}>
                <h2 style={{ fontSize: "var(--fs-1)", fontWeight: 600, color: "var(--text)", marginBottom: "var(--sp-2)" }}>
                  Social
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                  {facebook && (
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--blue)", fontSize: "var(--fs-0)", textDecoration: "none" }}
                    >
                      Facebook
                    </a>
                  )}
                  {youtube && (
                    <a
                      href={youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--blue)", fontSize: "var(--fs-0)", textDecoration: "none" }}
                    >
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Fallback if no settings */}
          {!email && !phone && (
            <div style={{
              background: "var(--bg-2)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              padding: "var(--sp-6)",
              textAlign: "center",
              color: "var(--text-muted)",
            }}>
              <p style={{ fontSize: "var(--fs-1)", marginBottom: "var(--sp-2)" }}>
                Contact details coming soon.
              </p>
              <p style={{ fontSize: "var(--fs-0)" }}>
                In the meantime, find us on our social media channels.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
