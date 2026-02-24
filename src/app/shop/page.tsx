"use client";

import Nav from "@/components/Nav";

const merch = [
  { icon: "👕", name: '"That\'s the Monochromacy Way" Tee', price: "$TBD" },
  { icon: "🧢", name: "NPC Bounty Hunter Cap", price: "$TBD" },
  { icon: "⚓", name: "Sailor Outfit (Deep Dive Edition)", price: "$TBD" },
  { icon: "🥕", name: "Carrot Logistics™ Tee", price: "$TBD" },
  { icon: "🖨️", name: "Printer Thief Reward Poster", price: "$TBD" },
  { icon: "🎰", name: "OfficeOdyssey™ 'No Exit' Hoodie", price: "$TBD" },
];

export default function Shop() {
  return (
    <>
      <Nav />
      <main style={{
        paddingTop: "64px", background: "var(--black)", minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "64px 2rem 6rem",
        position: "relative", overflow: "hidden"
      }}>
        {/* Ghost text */}
        <div style={{
          position: "absolute", fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "30vw", color: "rgba(0,255,65,0.02)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          pointerEvents: "none", whiteSpace: "nowrap", userSelect: "none",
          fontWeight: 700,
        }}>
          SHOP
        </div>

        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase",
          color: "var(--accent)", marginBottom: "2rem"
        }}>
          &gt; MERCHANDISE_DIVISION
        </p>

        <h1 style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "clamp(2rem, 4vw, 4rem)", fontWeight: 700,
          color: "var(--white)", lineHeight: 1.1, marginBottom: "1.5rem"
        }}>
          Wear the <em style={{ fontStyle: "normal", color: "var(--accent)" }}>Way.</em><span className="cursor"> _</span>
        </h1>

        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.82rem", color: "rgba(232,230,224,0.55)",
          maxWidth: "500px", margin: "0 auto 3rem", lineHeight: 1.8
        }}>
          Soon, you&apos;ll be able to represent Monochromacy in your daily life — at the office,
          at the obstacle course, or while disposing of your own company&apos;s data.
          Our merch line is currently in development. Or &ldquo;ideation.&rdquo; We&apos;re not sure which stage this is.
        </p>

        {/* Merch grid */}
        <div style={{
          display: "flex", gap: "1.5rem", justifyContent: "center",
          flexWrap: "wrap", marginBottom: "4rem", position: "relative", zIndex: 1
        }}>
          {merch.map((item) => (
            <div key={item.name} style={{
              background: "rgba(0,255,65,0.03)",
              border: "1px solid rgba(0,255,65,0.12)",
              padding: "2.5rem 2rem",
              width: "200px",
              textAlign: "center",
              position: "relative",
              transition: "all 0.3s",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,255,65,0.12)";
                (e.currentTarget as HTMLDivElement).style.transform = "none";
              }}
            >
              <span style={{
                position: "absolute", top: "-1px", right: "-1px",
                background: "var(--accent)", color: "var(--black)",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.55rem", letterSpacing: "0.15em",
                textTransform: "uppercase", padding: "0.3rem 0.6rem",
                textShadow: "none",
              }}>Soon</span>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{item.icon}</div>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.82rem", fontWeight: 700, color: "var(--white)", marginBottom: "0.5rem"
              }}>{item.name}</p>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.75rem", color: "rgba(0,255,65,0.55)", letterSpacing: "0.1em"
              }}>{item.price}</p>
            </div>
          ))}
        </div>

        {/* TODO: Replace this button with Shopify Buy SDK or link */}
        <button
          style={{
            background: "var(--accent)", color: "#000",
            border: "none", padding: "1rem 3rem",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: 600,
            position: "relative", zIndex: 1,
            textShadow: "none",
          }}
          onClick={() => alert("Coming soon. That's the Monochromacy way.")}
        >
          [ Notify Me When It&apos;s Ready ]
        </button>

        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.6rem", color: "rgba(0,255,65,0.3)",
          marginTop: "3rem", position: "relative", zIndex: 1
        }}>
          {/* Shopify integration goes here. See README for setup instructions. */}
          Shop powered by nothing yet. Powered by hope. That&apos;s the Monochromacy way.
        </p>
      </main>
    </>
  );
}
