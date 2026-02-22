"use client";

import { useState, useEffect, useRef } from "react";
import Nav from "@/components/Nav";
import styles from "./officeodyssey.module.css";

type Message = { role: "user" | "assistant"; content: string };
type Screen = "intro" | "playing" | "ended";

interface Outcome {
  ending: "acceptance" | "promotion" | "printer";
  line: string;
}

const ROOM_CYCLE = [
  "Conference Room B",
  "Conference Room B (Again)",
  "Conference Room B — Annex",
  "The 4th Floor",
  "Conference Room B — East Wing",
  "The Exit → Conference Room B",
  "Conference Room B (Sub-Level)",
  "The Server Closet → Conference Room B",
  "Conference Room B // Unknown",
  "The Lobby → Conference Room B",
  "Conference Room B — Restricted",
  "The Stairwell → 4th Floor",
];

const ENDING_COPY: Record<string, { title: string; icon: string; color: string }> = {
  acceptance: {
    title: "You Have Been Accepted",
    icon: "🪑",
    color: "#5ab87e",
  },
  promotion: {
    title: "Congratulations on Your Promotion",
    icon: "📋",
    color: "#c8b560",
  },
  printer: {
    title: "You Found It",
    icon: "🖨️",
    color: "#e05a5a",
  },
};

function parseOutcome(text: string): Outcome | null {
  const match = text.match(/\[OUTCOME\]([\s\S]*?)\[\/OUTCOME\]/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function cleanText(text: string): string {
  return text.replace(/\[OUTCOME\][\s\S]*?\[\/OUTCOME\]/g, "").trim();
}

export default function OfficeOdyssey() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const [timeInOffice, setTimeInOffice] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState("");
  const narrativeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Time in office counter
  useEffect(() => {
    if (screen !== "playing") return;
    const timer = setInterval(() => setTimeInOffice((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [screen]);

  // Auto-scroll narrative
  useEffect(() => {
    if (narrativeRef.current) {
      narrativeRef.current.scrollTop = narrativeRef.current.scrollHeight;
    }
  }, [messages, isWaiting]);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function currentRoom(): string {
    return ROOM_CYCLE[actionCount % ROOM_CYCLE.length];
  }

  async function callAPI(msgs: Message[]) {
    const res = await fetch("/api/adventure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API error");
    return data.content as string;
  }

  async function beginAdventure() {
    setScreen("playing");
    setIsWaiting(true);
    setError("");
    try {
      const reply = await callAPI([]);
      const o = parseOutcome(reply);
      const clean = cleanText(reply);
      const msg: Message = { role: "assistant", content: clean || reply };
      setHistory([msg]);
      setMessages([msg]);
      if (o) {
        setOutcome(o);
        setScreen("ended");
      }
    } catch {
      setError("Something went wrong. The building has declined to comment.");
    }
    setIsWaiting(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function submitAction() {
    const text = input.trim();
    if (!text || isWaiting) return;
    setInput("");
    setError("");

    const userMsg: Message = { role: "user", content: text };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setMessages((prev) => [...prev, userMsg]);
    setIsWaiting(true);
    setActionCount((c) => c + 1);

    try {
      const reply = await callAPI(newHistory);
      const o = parseOutcome(reply);
      const clean = cleanText(reply);
      const assistantMsg: Message = { role: "assistant", content: clean || reply };

      setHistory((prev) => [...prev, assistantMsg]);
      setMessages((prev) => [...prev, assistantMsg]);

      if (o) {
        setTimeout(() => {
          setOutcome(o);
          setScreen("ended");
        }, 1200);
      }
    } catch (e) {
      setError((e as Error).message || "An error occurred.");
    }
    setIsWaiting(false);
  }

  function restart() {
    setScreen("intro");
    setMessages([]);
    setHistory([]);
    setInput("");
    setIsWaiting(false);
    setActionCount(0);
    setTimeInOffice(0);
    setOutcome(null);
    setError("");
  }

  return (
    <>
      <Nav />
      <div className={styles.wrapper}>

        {/* Header bar */}
        <div className={styles.headerBar}>
          <div className={styles.logoGroup}>
            <span className={styles.logoIcon}>🎰</span>
            <span className={styles.logoText}>Office<span>Odyssey</span>™</span>
          </div>
          <div className={styles.headerMeta}>
            Monochromacy Facilities Division · Workplace Navigation Suite v1.0
          </div>
          <div className={styles.headerStatus}>
            <span className={styles.statusDot} />
            Building: Operational
          </div>
        </div>

        <main className={styles.main}>

          {/* ── INTRO SCREEN ── */}
          {screen === "intro" && (
            <div className={styles.introScreen}>
              <div className={styles.introEmblem}>🎰</div>
              <p className={styles.introTag}>Monochromacy — Facilities Division</p>
              <h1 className={styles.introTitle}>
                Office<span>Odyssey</span>™
              </h1>
              <p className={styles.introSubtitle}>
                Workplace Navigation Training Suite
              </p>

              <div className={styles.introBody}>
                <p>
                  Welcome to OfficeOdyssey™, Monochromacy&apos;s proprietary workplace navigation
                  training program. You will be placed inside a simulated office environment
                  and asked to locate the exit.
                </p>
                <p>
                  The simulation is based on our actual headquarters, which was designed
                  at our request to resemble a casino. No clocks. No windows.
                  No visible exits.
                </p>
                <p>
                  Type what you would like to do. The building will respond accordingly.
                </p>
              </div>

              <div className={styles.disclaimer}>
                <strong>FACILITIES NOTICE:</strong> OfficeOdyssey™ is a mandatory training module.
                Failure to locate the exit within a reasonable timeframe will be noted.
                &quot;Reasonable&quot; has not been defined. That is also intentional.{" "}
                <strong>That&apos;s the Monochromacy way.</strong>
              </div>

              <button className={styles.btnBegin} onClick={beginAdventure}>
                Begin Shift →
              </button>
            </div>
          )}

          {/* ── PLAYING SCREEN ── */}
          {screen === "playing" && (
            <div className={styles.gameScreen}>
              <div className={styles.narrative} ref={narrativeRef}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`${styles.entry} ${msg.role === "assistant" ? styles.entrySystem : styles.entryUser}`}
                  >
                    {msg.role === "user" && (
                      <div className={styles.entryLabel}>› Your Action</div>
                    )}
                    {msg.role === "assistant" && (
                      <div className={styles.entryLabel}>OfficeOdyssey™</div>
                    )}
                    <div className={styles.entryBody}>
                      {msg.content.split("\n").map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < msg.content.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {isWaiting && (
                  <div className={styles.thinking}>
                    <span className={styles.thinkingDot} />
                    <span className={styles.thinkingDot} />
                    <span className={styles.thinkingDot} />
                    <span className={styles.thinkingLabel}>Building responding...</span>
                  </div>
                )}
                {error && <div className={styles.errorMsg}>{error}</div>}
              </div>

              <div className={styles.sidebar}>
                <div className={styles.sidebarCard}>
                  <div className={styles.sidebarLabel}>Current Location</div>
                  <div className={styles.sidebarValue}>{currentRoom()}</div>
                </div>
                <div className={styles.sidebarCard}>
                  <div className={styles.sidebarLabel}>Current Time</div>
                  <div className={styles.sidebarValue}>9:00 AM</div>
                  <div className={styles.sidebarNote}>No clocks in building. By design.</div>
                </div>
                <div className={styles.sidebarCard}>
                  <div className={styles.sidebarLabel}>Time in Office</div>
                  <div className={styles.sidebarValue}>{formatTime(timeInOffice)}</div>
                  <div className={styles.sidebarNote}>This readout is an anomaly. IT is aware.</div>
                </div>
                <div className={styles.sidebarCard}>
                  <div className={styles.sidebarLabel}>Floors Explored</div>
                  <div className={styles.sidebarValue}>4th</div>
                  <div className={styles.sidebarNote}>All floors are the 4th floor.</div>
                </div>
                <div className={styles.sidebarCard}>
                  <div className={styles.sidebarLabel}>Actions Taken</div>
                  <div className={styles.sidebarValue}>{actionCount}</div>
                </div>
                <div className={styles.sidebarCard}>
                  <div className={styles.sidebarLabel}>HR Status</div>
                  <div className={styles.sidebarValueDim}>Auto-reply sent</div>
                  <div className={styles.sidebarNote}>HR will follow up shortly.</div>
                </div>
              </div>

              <div className={styles.inputArea}>
                <textarea
                  ref={inputRef}
                  className={styles.textarea}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submitAction();
                  }}
                  placeholder="What do you do? (e.g. try the door, go north, check the vending machine...)"
                  rows={3}
                  disabled={isWaiting}
                />
                <div className={styles.inputFooter}>
                  <span className={styles.inputHint}>Ctrl+Enter to submit · The building is watching</span>
                  <button
                    className={styles.btnSubmit}
                    onClick={submitAction}
                    disabled={isWaiting || !input.trim()}
                  >
                    Take Action →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ENDED SCREEN ── */}
          {screen === "ended" && outcome && (
            <div className={styles.endedScreen}>
              {(() => {
                const copy = ENDING_COPY[outcome.ending];
                return (
                  <>
                    <div className={styles.endIcon} style={{ color: copy.color }}>
                      {copy.icon}
                    </div>
                    <h2 className={styles.endTitle} style={{ color: copy.color }}>
                      {copy.title}
                    </h2>
                    <p className={styles.endLine}>&ldquo;{outcome.line}&rdquo;</p>

                    <div className={styles.endStats}>
                      <div className={styles.endStat}>
                        <div className={styles.endStatLabel}>Actions Taken</div>
                        <div className={styles.endStatValue}>{actionCount}</div>
                      </div>
                      <div className={styles.endStat}>
                        <div className={styles.endStatLabel}>Time in Office</div>
                        <div className={styles.endStatValue}>{formatTime(timeInOffice)}</div>
                      </div>
                      <div className={styles.endStat}>
                        <div className={styles.endStatLabel}>Outcome</div>
                        <div className={styles.endStatValue} style={{ textTransform: "capitalize" }}>
                          {outcome.ending}
                        </div>
                      </div>
                    </div>

                    <div className={styles.endNote}>
                      This session has been recorded. Results will be shared with your manager.
                      Your manager is in Conference Room B.
                    </div>

                    <div className={styles.endActions}>
                      <button className={styles.btnGhost} onClick={restart}>
                        Return to Office
                      </button>
                      <a href="/portal" className={styles.btnGhost}>
                        Back to Portal
                      </a>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

        </main>

        <div className={styles.footerBar}>
          <span>OfficeOdyssey™ is a <a href="/">Monochromacy</a> Facilities product</span>
          <span>Exit located on the 4th floor. <em>The 4th floor cannot be found.</em></span>
        </div>
      </div>
    </>
  );
}
