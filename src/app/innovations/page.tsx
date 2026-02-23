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
    title: "OfficeOdyssey™",
    desc: "AI-powered workplace navigation training. You are placed in a simulated casino-style office and asked to find the exit. No clocks. No windows. No visible exits. Success rate is classified.",
    type: "real",
    link: "/officeodyssey",
    linkLabel: "Enter the office →",
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
    desc: "NATO-certified obstacle course simulation. Commands appear on screen — execute them before the timer expires. Available in Standard, Extreme, and 'We're Being Audited' difficulty settings. Results are logged.",
    type: "real",
    link: "/agileforce",
    linkLabel: "Begin Protocol →",
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
      <main style={{ paddingTop: "64px", background: "var(--black)", minHeight: "100vh" }}>
        <section style={{ padding: "8rem 6rem", maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", marginBottom: "5rem" }}>
            <div>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.65rem", letterSpacing: "0.3em",
                textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem"
              }}>&gt; WHAT_WE&apos;VE_BUILT</p>
              <h1 style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "clamp(2rem, 3.5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.15,
                color: "var(--accent)"
              }}>
                Products that <em style={{ fontStyle: "normal", color: "rgba(0,255,65,0.65)" }}>change</em><br />the game.
              </h1>
            </div>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.82rem", lineHeight: 2, color: "rgba(0,255,65,0.55)", paddingTop: "0.5rem"
            }}>
              Our innovation pipeline is constantly evolving. Some of what we&apos;ve built is real.
              Some of it exists only in the Monochromacy Ideation Metaspace™.
              We&apos;ve labeled them, so it&apos;s fine.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {innovations.map((item) => (
              <div key={item.title} style={{
                border: "1px solid rgba(0,255,65,0.15)",
                background: "rgba(0,255,65,0.02)",
                overflow: "hidden",
                transition: "all 0.3s",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,255,65,0.15)";
                  (e.currentTarget as HTMLDivElement).style.transform = "none";
                }}
              >
                <div style={{
                  height: "180px", background: "var(--black)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "3.5rem", position: "relative",
                  borderBottom: "1px solid rgba(0,255,65,0.1)"
                }}>
                  {item.icon}
                  <span style={{
                    position: "absolute", top: "1rem", right: "1rem",
                    fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase",
                    padding: "0.3rem 0.7rem", border: "1px solid",
                    color: item.type === "real" ? "#5ab87e" : "var(--accent)",
                    borderColor: item.type === "real" ? "#5ab87e" : "var(--accent)",
                    background: item.type === "real" ? "rgba(90,184,126,0.1)" : "rgba(0,255,65,0.1)",
                    fontFamily: "'IBM Plex Mono', monospace",
                    textShadow: "none",
                  }}>
                    {item.type === "real" ? "[ LIVE ]" : "[ CONCEPT ]"}
                  </span>
                </div>
                <div style={{ padding: "1.75rem" }}>
                  <h3 style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem",
                    color: "var(--accent)"
                  }}>{item.title}</h3>
                  <p style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.75rem", lineHeight: 1.8, color: "rgba(0,255,65,0.55)"
                  }}>{item.desc}</p>
                  {item.link && (
                    <a href={item.link} style={{
                      display: "inline-block", marginTop: "1.25rem",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase",
                      color: "var(--accent)", textDecoration: "none",
                      borderBottom: "1px solid rgba(0,255,65,0.4)", paddingBottom: "2px"
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
