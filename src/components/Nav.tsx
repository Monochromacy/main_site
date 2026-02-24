"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const links = [
    { href: "/#about", label: "Mission" },
    { href: "/#tweets", label: "Social" },
    { href: "/innovations", label: "Innovations" },
    { href: "/portal", label: "Portal" },
    { href: "/shop", label: "Shop" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "var(--black)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 3rem",
      height: "64px",
      borderBottom: "2px solid var(--accent)",
    }}>
      <Link href="/" style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontWeight: 700,
        fontSize: "1.4rem",
        color: "var(--white)",
        letterSpacing: "0.04em",
        textDecoration: "none",
      }}>
        <span className="logo-full">Monochromacy.</span>
        <span className="logo-mark">M</span>
      </Link>

      <ul style={{ display: "flex", gap: "2rem", listStyle: "none" }}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              style={{
                color: pathname === link.href ? "var(--accent)" : "var(--white)",
                textDecoration: "none",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: pathname === link.href ? 1 : 0.7,
                transition: "all 0.2s",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
