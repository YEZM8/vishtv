import Link from "next/link";
import Image from "next/image";

const FOOTER_SECTIONS = [
  {
    title: "Watch",
    links: [
      { href: "/watch", label: "Live" },
      { href: "/browse", label: "Programmes" },
      { href: "/news", label: "News" },
      { href: "/radio", label: "Radio" },
    ],
  },
  {
    title: "Connect",
    links: [
      {
        href: "https://www.youtube.com/channel/UCeqWSlqqNO2F5zPWq-pQEcA",
        label: "YouTube",
        external: true,
      },
      {
        href: "https://www.facebook.com/VishvavahiniTV/",
        label: "Facebook",
        external: true,
      },
      { href: "/contact", label: "WhatsApp" },
      { href: "/contact", label: "Newsletter" },
    ],
  },
  {
    title: "Channel",
    links: [
      { href: "/about", label: "About us" },
      { href: "/advertise", label: "Sponsor a show" },
      { href: "/contact", label: "Contact" },
      { href: "/events", label: "Events" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <div>
          <Link
            className="brand"
            href="/"
            style={{ color: "#fff" }}
            aria-label="VishTV home"
          >
            <Image
              className="brand-logo"
              style={{ height: "3em", width: "auto", opacity: 1 }}
              src="/assets/vishvavahini-logo-primary-transparent.png"
              alt="VishTV"
              width={240}
              height={64}
            />
          </Link>
          <p
            style={{
              margin: "1rem 0 0",
              maxWidth: "36ch",
              color: "var(--text-muted)",
            }}
          >
            Australia&apos;s first Sri Lankan-owned IPTV channel. Broadcasting
            live from Melbourne to the global diaspora.
          </p>
        </div>

        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title}>
            <h4>{section.title}</h4>
            <ul>
              {section.links.map((link) => (
                <li key={link.label}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href}>{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="foot-inner">
        <div className="legal" style={{ gridColumn: "1 / -1" }}>
          <Image
            src="/assets/vishvavahini-logo-primary-transparent.png"
            alt="VishTV"
            width={120}
            height={32}
            style={{ height: "1.8em", width: "auto", opacity: 1, marginBottom: "var(--sp-2)" }}
          />
          <span>&copy; 2026 Vishvavahini TV Pty Ltd &middot; vishtv.com</span>
          <span>Privacy &middot; Terms &middot; Accessibility</span>
        </div>
      </div>
    </footer>
  );
}
