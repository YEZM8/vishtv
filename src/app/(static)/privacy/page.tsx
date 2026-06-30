import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Vishvavahini — how we collect, use and protect your information.",
};

const h2: CSSProperties = {
  fontSize: "var(--fs-2)",
  fontWeight: 600,
  color: "var(--text)",
  margin: "var(--sp-6) 0 var(--sp-3)",
};
const p: CSSProperties = { marginBottom: "var(--sp-4)" };
const ul: CSSProperties = { paddingLeft: "var(--sp-5)", marginBottom: "var(--sp-4)" };
const li: CSSProperties = { marginBottom: "var(--sp-2)" };

export default function PrivacyPage() {
  return (
    <>
      <Topbar />

      <main id="main-content">
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "calc(var(--sp-8) + 60px) var(--safe) var(--sp-8)",
          }}
        >
          <h1 style={{ fontSize: "var(--fs-4)", fontWeight: 700, marginBottom: "var(--sp-2)" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "var(--sp-5)" }}>
            Effective Date: 24/08/2024
          </p>

          <div style={{ fontSize: "var(--fs-0)", lineHeight: 1.75, color: "var(--text-muted)" }}>
            <h2 style={h2}>1. Introduction</h2>
            <p style={p}>
              Welcome to Vishvavahini (referred to as &quot;we,&quot; &quot;our,&quot; or
              &quot;the Site&quot;). We are committed to protecting your privacy and ensuring that
              your personal information is handled in a safe and responsible manner. This Privacy
              Policy explains what information we collect, how we use it, and the measures we take
              to protect it.
            </p>

            <h2 style={h2}>2. Information We Collect</h2>
            <p style={p}>We may collect the following types of information:</p>
            <ul style={ul}>
              <li style={li}>
                <strong>Personal Information:</strong> Name, email address, phone number, and other
                contact details that you provide when you register, subscribe, download our app, or
                communicate with us.
              </li>
              <li style={li}>
                <strong>Usage Data:</strong> Information about your interactions with the Site and
                our mobile applications, including IP address, device information, browser type,
                pages visited, and the time spent on each page.
              </li>
              <li style={li}>
                <strong>App Store Data:</strong> Information related to your interactions with our
                mobile applications on the Apple App Store and Google Play Store, such as app usage
                data, crash reports, and user feedback.
              </li>
              <li style={li}>
                <strong>Cookies and Tracking Technologies:</strong> Information collected through
                cookies, web beacons, and similar technologies to enhance your experience on our
                Site and mobile applications.
              </li>
            </ul>

            <h2 style={h2}>3. How We Use Your Information</h2>
            <p style={p}>We may use the information we collect for various purposes, including:</p>
            <ul style={ul}>
              <li style={li}>
                To provide and maintain our services, including our mobile applications.
              </li>
              <li style={li}>To improve and personalize your experience on the Site and within our apps.</li>
              <li style={li}>
                To communicate with you, including responding to inquiries and sending updates or
                promotional materials.
              </li>
              <li style={li}>To analyze usage patterns and improve the functionality of the Site and apps.</li>
              <li style={li}>To comply with legal obligations.</li>
            </ul>

            <h2 style={h2}>4. Sharing Your Information</h2>
            <p style={p}>
              We do not sell, trade, or rent your personal information to third parties. However, we
              may share your information in the following circumstances:
            </p>
            <ul style={ul}>
              <li style={li}>
                <strong>Service Providers:</strong> We may share your information with third-party
                service providers who perform services on our behalf, such as hosting, data
                analysis, and marketing.
              </li>
              <li style={li}>
                <strong>App Store Providers:</strong> We may share certain information with Apple
                (via the Apple App Store) and Google (via Google Play Store) as required for app
                distribution and user support.
              </li>
              <li style={li}>
                <strong>Legal Requirements:</strong> We may disclose your information if required by
                law or in response to legal requests, such as court orders or subpoenas.
              </li>
              <li style={li}>
                <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale
                of assets, your information may be transferred to the new owner.
              </li>
            </ul>

            <h2 style={h2}>5. Mobile Applications</h2>
            <p style={p}>
              When you download and use our mobile applications, we may collect additional
              information, such as mobile device IDs, operating system information, and usage
              statistics. This data helps us improve our app functionality and user experience.
            </p>

            <h2 style={h2}>6. Google Services</h2>
            <p style={p}>
              Our Site and mobile applications may use Google services such as Google Analytics,
              Google AdMob, and Firebase. These services help us analyze traffic, improve app
              performance, and deliver relevant advertisements. Information collected through these
              services may include your IP address, app usage data, and in-app activity.
            </p>

            <h2 style={h2}>7. Cookies and Tracking Technologies</h2>
            <p style={p}>
              We use cookies and similar tracking technologies to collect information about your
              interactions with the Site and our mobile applications. You can control the use of
              cookies through your browser or device settings. However, disabling cookies may affect
              your ability to use certain features of the Site and apps.
            </p>

            <h2 style={h2}>8. Security of Your Information</h2>
            <p style={p}>
              We take reasonable precautions to protect your personal information from unauthorized
              access, use, or disclosure. However, no method of transmission over the internet or
              electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 style={h2}>9. Your Rights and Choices</h2>
            <p style={p}>
              Depending on your location, you may have certain rights regarding your personal
              information, including the right to access, correct, or delete your data. You may also
              have the right to object to or restrict certain types of processing. To exercise these
              rights, please contact us at tv.vishvavahini@gmail.com.
            </p>

            <h2 style={h2}>10. Third-Party Links</h2>
            <p style={p}>
              The Site and our mobile applications may contain links to third-party websites and
              services. We are not responsible for the privacy practices or content of these sites.
              We encourage you to read the privacy policies of any third-party websites or services
              you visit.
            </p>

            <h2 style={h2}>11. Children&apos;s Privacy</h2>
            <p style={p}>
              Our Site and mobile applications are not intended for use by individuals under the age
              of 13. We do not knowingly collect personal information from children under 13. If we
              become aware that we have collected personal information from a child under 13, we will
              take steps to delete such information.
            </p>

            <h2 style={h2}>12. Changes to This Privacy Policy</h2>
            <p style={p}>
              We may update this Privacy Policy from time to time to reflect changes in our practices
              or legal requirements. We will notify you of any significant changes by posting the new
              policy on this page and updating the &quot;Effective Date&quot; above.
            </p>

            <h2 style={h2}>13. Contact Us</h2>
            <p style={p}>
              If you have any questions or concerns about this Privacy Policy, please contact us at:
              <br />
              Vishvavahini
              <br />
              Email: tv.vishvavahini@gmail.com
              <br />
              Phone: +94 70 3861845
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
