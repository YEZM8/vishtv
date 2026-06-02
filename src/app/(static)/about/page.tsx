import type { Metadata } from "next";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About",
  description: "About VishTV — community television for the Sri Lankan diaspora in Australia.",
};

export default function AboutPage() {
  return (
    <>
      <Topbar />

      <main id="main-content">
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "calc(var(--sp-8) + 60px) var(--safe) var(--sp-8)",
        }}>
          <h1 style={{ fontSize: "var(--fs-4)", fontWeight: 700, marginBottom: "var(--sp-5)" }}>
            About VishTV
          </h1>

          <div style={{ fontSize: "var(--fs-0)", lineHeight: 1.75, color: "var(--text-muted)" }}>
            <p style={{ marginBottom: "var(--sp-4)" }}>
              Vishvavahini (VishTV) is a community-owned television channel serving the
              Sri Lankan diaspora in Australia. Broadcasting from Melbourne, we bring
              news, current affairs, drama, music and sport to viewers across the country
              and around the world.
            </p>

            <h2 style={{ fontSize: "var(--fs-2)", fontWeight: 600, color: "var(--text)", margin: "var(--sp-6) 0 var(--sp-3)" }}>
              Our Mission
            </h2>
            <p style={{ marginBottom: "var(--sp-4)" }}>
              To preserve and promote Sri Lankan culture, language and community connection
              for diaspora families in Australia. We provide a trusted platform for news,
              entertainment and community engagement in both Sinhala and English.
            </p>

            <h2 style={{ fontSize: "var(--fs-2)", fontWeight: 600, color: "var(--text)", margin: "var(--sp-6) 0 var(--sp-3)" }}>
              What We Do
            </h2>
            <ul style={{ paddingLeft: "var(--sp-5)", marginBottom: "var(--sp-4)" }}>
              <li style={{ marginBottom: "var(--sp-2)" }}>Live news and current affairs programming</li>
              <li style={{ marginBottom: "var(--sp-2)" }}>Original drama and entertainment shows</li>
              <li style={{ marginBottom: "var(--sp-2)" }}>Community event coverage</li>
              <li style={{ marginBottom: "var(--sp-2)" }}>Health, business and lifestyle programming</li>
              <li style={{ marginBottom: "var(--sp-2)" }}>Live streaming on YouTube and our website</li>
            </ul>

            <h2 style={{ fontSize: "var(--fs-2)", fontWeight: 600, color: "var(--text)", margin: "var(--sp-6) 0 var(--sp-3)" }}>
              Community Owned
            </h2>
            <p style={{ marginBottom: "var(--sp-4)" }}>
              VishTV is supported by viewers, sponsors and advertisers from within the
              Sri Lankan Australian community. We are committed to independent, community-focused
              broadcasting that serves the interests of our audience.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
