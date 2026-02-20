"use client";

import Nav from "@/components/Nav";

const innovations = [
  {
    icon: "🛡️",
    title: "PreachBreachPro™",
    desc: "Why wait for hackers to expose your sensitive data when you can do it yourself, on your own schedule, with full branding? PreachBreachPro™ lets you preemptively leak your own company data in a controlled, aesthetically pleasing format.",
    type: "conceptual",
  },
  {
    icon: "⚓",
    title: "DeepDive™ Analytics Suite",
    desc: "Our proprietary submarine-based analytics platform. Data scientists in sailor outfits conduct research at depths of up to 200 meters. Insights are delivered via underwater telegraph. The latency is terrible but the aesthetic is immaculate.",
    type: "conceptual",
  },
  {
    icon: "🎰",
    title: "OfficeOdyssey™ Design",
    desc: "A full workplace design consultancy specializing in casino-style office environments. No clocks. No windows. No visible exits. Employees stay focused because they genuinely cannot find the door. Productivity up 40%.* *Unverified.",
    type: "conceptual",
  },
  {
    icon: "🤖",
    title: "NPCDetect™",
    desc: "Our AI-powered employee screening tool identifies non-player characters within your workforce. Uses behavioral biometrics, dialogue pattern analysis, and vibes. Bounties issued upon confirmation. HR loves it (HR does not love it).",
    type: "real",
    link: "/npcdetect",
    linkLabel: "Try it →",
  },
  {
    icon: "🪖",
    title: "AgileForce™ Morning Protocol",
    desc: "Start every workday the NATO way. Our morning obstacle course program gets employees physically and mentally prepared for their 9am standups. Available in Standard, Extreme, and 'We're Being Audited' difficulty settings.",
    type: "conceptual",
  },
  {
    icon: "🥕",
    title: "Carrot Logistics™",
    desc: "A B2B surprise delivery service. We send raw carrots to your clients for no reason whatsoever. Keeps relationships fresh. Keeps clients guessing. Keeps our pallet inventory moving. Everybody wins, mostly us.",
    type: "conceptual",
  },
];

export default function Innovations() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: "64px", background: "var(--white)", minHeight: "100vh" }}>
        <section style={{ padding: "8rem 6rem", maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", marginBottom: "5rem" }}>
            <div>
              <p style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.65rem", letterSpacing: "0.3em",
                textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem"
              }}>What We&apos;ve Built</p>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.5rem, 4vw, 4rem)", fontWeight: 700, lineHeight: 1.15
              }}>
                Products that <em style={{ fontStyle: "italic", color: "var(--accent)" }}>change</em><br />the game.
              </h1>
            </div>
            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.85rem", lineHeight: 2, color: "#555", paddingTop: "0.5rem"
            }}>
              Our innovation pipeline is constantly evolving. Some of what we&apos;ve built is real.
              Some of it exists only in the Monochromacy Ideation Metaspace™.
              We&apos;ve labeled them, so it&apos;s fine.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {innovations.map((item) => (
              <div key={item.title} style={{
                border: "1px solid rgba(10,10,10,0.1)",
                overflow: "hidden",
                transition: "all 0.3s",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(10,10,10,0.1)";
                  (e.currentTarget as HTMLDivElement).style.transform = "none";
                }}
              >
                <div style={{
                  height: "180px", background: "var(--black)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "3.5rem", position: "relative"
                }}>
                  {item.icon}
                  <span style={{
                    position: "absolute", top: "1rem", right: "1rem",
                    fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase",
                    padding: "0.3rem 0.7rem", border: "1px solid",
                    color: item.type === "real" ? "#5ab87e" : "var(--accent)",
                    borderColor: item.type === "real" ? "#5ab87e" : "var(--accent)",
                    background: item.type === "real" ? "rgba(90,184,126,0.1)" : "rgba(200,181,96,0.1)",
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {item.type === "real" ? "Live" : "Conceptual"}
                  </span>
                </div>
                <div style={{ padding: "1.75rem" }}>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem"
                  }}>{item.title}</h3>
                  <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.78rem", lineHeight: 1.8, color: "#555"
                  }}>{item.desc}</p>
                  {item.link && (
                    <a href={item.link} style={{
                      display: "inline-block", marginTop: "1.25rem",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase",
                      color: "var(--black)", textDecoration: "none",
                      borderBottom: "1px solid var(--accent)", paddingBottom: "2px"
                    }}>
                      {item.linkLabel}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
