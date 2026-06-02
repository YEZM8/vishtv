import type { Metadata } from "next";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Advertise",
  description: "Sponsor a show or advertise on VishTV — reach the Sri Lankan community in Australia.",
};

export default function AdvertisePage() {
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
            Advertise with VishTV
          </h1>
          <p style={{
            fontSize: "var(--fs-1)",
            color: "var(--text-muted)",
            marginBottom: "var(--sp-6)",
            lineHeight: 1.5,
          }}>
            Reach the Sri Lankan Australian community through television,
            online streaming and social media.
          </p>

          <div style={{ fontSize: "var(--fs-0)", lineHeight: 1.75, color: "var(--text-muted)" }}>
            <h2 style={{ fontSize: "var(--fs-2)", fontWeight: 600, color: "var(--text)", margin: "0 0 var(--sp-3)" }}>
              Why VishTV?
            </h2>
            <ul style={{ paddingLeft: "var(--sp-5)", marginBottom: "var(--sp-6)" }}>
              <li style={{ marginBottom: "var(--sp-2)" }}>Targeted reach to the Sri Lankan diaspora in Australia</li>
              <li style={{ marginBottom: "var(--sp-2)" }}>Live TV, on-demand and social media presence</li>
              <li style={{ marginBottom: "var(--sp-2)" }}>Bilingual content in Sinhala and English</li>
              <li style={{ marginBottom: "var(--sp-2)" }}>Trusted community platform with loyal viewership</li>
              <li style={{ marginBottom: "var(--sp-2)" }}>Flexible packages for businesses of all sizes</li>
            </ul>

            <h2 style={{ fontSize: "var(--fs-2)", fontWeight: 600, color: "var(--text)", margin: "0 0 var(--sp-3)" }}>
              Advertising Options
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--sp-4)",
              marginBottom: "var(--sp-6)",
            }}>
              {[
                { title: "Show Sponsorship", desc: "Become the presenting sponsor of a VishTV programme." },
                { title: "TV Commercials", desc: "Run your ad during commercial breaks across our schedule." },
                { title: "Digital & Social", desc: "Reach viewers on YouTube, Facebook and our website." },
                { title: "Event Coverage", desc: "Partner with us for community event broadcast sponsorship." },
              ].map((option) => (
                <div
                  key={option.title}
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-md)",
                    padding: "var(--sp-4)",
                  }}
                >
                  <h3 style={{ fontSize: "var(--fs-1)", fontWeight: 600, color: "var(--text)", marginBottom: "var(--sp-2)" }}>
                    {option.title}
                  </h3>
                  <p style={{ fontSize: "var(--fs--1)", color: "var(--text-dim)", margin: 0 }}>
                    {option.desc}
                  </p>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: "var(--fs-2)", fontWeight: 600, color: "var(--text)", margin: "0 0 var(--sp-3)" }}>
              Get in Touch
            </h2>
            <p style={{ marginBottom: "var(--sp-4)" }}>
              For advertising enquiries, sponsorship packages and rate cards,
              please contact our team.
            </p>
            <a className="btn btn-brand" href="/contact">
              Contact us
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
