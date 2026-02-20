import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monochromacy — That's the Monochromacy Way",
  description:
    "We're not just a company. We're a way of life. Fortune 500-Adjacent™.",
  openGraph: {
    title: "Monochromacy",
    description: "Moving Fast, Breaking Everything.",
    siteName: "Monochromacy",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Mono:wght@300;400;500&family=Bebas+Neue&family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
