"use client";

import { useState, useRef, useEffect } from "react";
import Nav from "@/components/Nav";
import styles from "./npcdetect.module.css";

type Message = { role: "user" | "assistant"; content: string };
type Screen = "boot" | "interview" | "verdict";

interface Verdict {
  score: number;
  classification: string;
  stamp: string;
  title: string;
  findings: string;
}

const MAX_QUESTIONS = 7;

function parseVerdict(text: string): Verdict | null {
  const match = text.match(/\[VERDICT\]([\s\S]*?)\[\/VERDICT\]/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function cleanText(text: string): string {
  return text.replace(/\[VERDICT\][\s\S]*?\[\/VERDICT\]/g, "").trim();
}

function getColorClass(score: number) {
  if (score <= 30) return "human";
  if (score >= 61) return "npc";
  return "inconclusive";
}

export default function NPCDetect() {
  const [screen, setScreen] = useState<Screen>("boot");
  const [bootDone, setBootDone] = useState(false);
  const [bootLines, setBootLines] = useState<boolean[]>([false, false, false, false, false, false]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [error, setError] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  // Boot sequence
  useEffect(() => {
    if (screen !== "boot") return;
    let i = 0;
    const interval = setInterval(() => {
      setBootLines((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
      i++;
      if (i >= 6) {
        clearInterval(interval);
        setTimeout(() => setBootDone(true), 300);
      }
    }, 650);
    return () => clearInterval(interval);
  }, [screen]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isWaiting]);

  // Animate score on verdict
  useEffect(() => {
    if (!verdict) return;
    let current = 0;
    const target = verdict.score;
    const step = target / (1500 / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedScore(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [verdict]);

  async function callAPI(msgs: Message[]) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API error");
    return data.content as string;
  }

  async function beginInterview() {
    setScreen("interview");
    setIsWaiting(true);
    try {
      const reply = await callAPI([]);
      const v = parseVerdict(reply);
      if (v) { setVerdict(v); setScreen("verdict"); return; }
      const msg: Message = { role: "assistant", content: reply };
      setHistory([msg]);
      setMessages([msg]);
      setQuestionCount(1);
    } catch (e) {
      setError("Connection issue. HR-9 is experiencing technical difficulties.");
    }
    setIsWaiting(false);
  }

  async function submitAnswer() {
    const text = input.trim();
    if (!text || isWaiting) return;
    setInput("");
    setError("");

    const userMsg: Message = { role: "user", content: text };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setMessages((prev) => [...prev, userMsg]);
    setIsWaiting(true);

    try {
      const reply = await callAPI(newHistory);
      const v = parseVerdict(reply);
      const clean = cleanText(reply);
      const assistantMsg: Message = { role: "assistant", content: clean || reply };

      if (v) {
        if (clean) {
          setMessages((prev) => [...prev, assistantMsg]);
        }
        setTimeout(() => {
          setVerdict(v);
          setScreen("verdict");
        }, clean ? 1800 : 400);
      } else {
        setHistory((prev) => [...prev, assistantMsg]);
        setMessages((prev) => [...prev, assistantMsg]);
        setQuestionCount((q) => q + 1);
        setIsWaiting(false);
      }
    } catch (e) {
      setError((e as Error).message || "Something went wrong.");
      setIsWaiting(false);
    }
  }

  function restart() {
    setScreen("boot");
    setBootDone(false);
    setBootLines([false, false, false, false, false, false]);
    setMessages([]);
    setHistory([]);
    setInput("");
    setIsWaiting(false);
    setQuestionCount(0);
    setVerdict(null);
    setAnimatedScore(0);
    setError("");
  }

  const logLabels = [
    "Loading behavioral heuristic engine...",
    "Calibrating vibe sensors...",
    "Cross-referencing NPC behavioral database...",
    "Warming up interrogation protocols...",
    "HR notified of pending screening...",
    "All systems nominal. Ready to screen.",
  ];

  const colorCls = verdict ? getColorClass(verdict.score) : "inconclusive";

  return (
    <>
      <Nav />
      <div className={styles.wrapper}>

        {/* HEADER BAR */}
        <div className={styles.headerBar}>
          <div className={styles.logoGroup}>
            <div className={styles.logoMark}>⬡</div>
            <span className={styles.logoText}>NPC<span>Detect</span>™</span>
          </div>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            System Operational
          </div>
          <div className={styles.corpTag}>
            Monochromacy Workforce Intelligence<br />
            <span>HR Division</span>
          </div>
        </div>

        <main className={styles.main}>

          {/* ── BOOT SCREEN ── */}
          {screen === "boot" && (
            <div className={styles.bootScreen}>
              <div className={styles.bootEmblem}>
                <div className={styles.bootEmblemInner}>👁️</div>
              </div>
              <p className={styles.bootTag}>Monochromacy — Workforce Intelligence Suite v2.4</p>
              <h1 className={styles.bootTitle}>NPC<span>Detect</span>™</h1>
              <p className={styles.bootSubtitle}>
                Our proprietary AI-powered screening protocol identifies non-player characters
                within your workforce using behavioral biometrics, dialogue pattern analysis, and vibes.
              </p>

              <div className={styles.bootLog}>
                {logLabels.map((label, i) => (
                  <div
                    key={i}
                    className={`${styles.logLine} ${bootLines[i] ? styles.logDone : ""} ${i === 5 ? styles.logFinal : ""}`}
                  >
                    {bootLines[i] ? (i < 5 ? "[ OK   ]" : "[ OK   ]") : "[ .... ]"} {label}
                  </div>
                ))}
              </div>

              <div className={styles.disclaimer}>
                <strong>NOTICE FROM HR:</strong> Participation in NPCDetect™ screening is encouraged
                but technically voluntary. Results are logged, retained indefinitely, and may be
                referenced in future performance reviews. By proceeding you acknowledge that
                Monochromacy bears no responsibility for findings, classifications, or bounties
                issued as a result of this assessment. <strong>That&apos;s the Monochromacy way.</strong>
              </div>

              <button
                className={styles.btnInit}
                disabled={!bootDone}
                onClick={beginInterview}
              >
                Initialize Screening Protocol
              </button>
            </div>
          )}

          {/* ── INTERVIEW SCREEN ── */}
          {screen === "interview" && (
            <div className={styles.interviewScreen}>
              <div className={styles.interviewHeader}>
                <div className={styles.interviewMeta}>
                  Protocol: <strong>STANDARD-7B</strong><br />
                  Interviewer: <strong>Unit HR-9 (Polite)</strong><br />
                  Status: <strong className={styles.activeStatus}>ACTIVE — DO NOT LEAVE</strong>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressLabel}>
                    Question {Math.min(questionCount, MAX_QUESTIONS)} of {MAX_QUESTIONS}
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.chatWindow} ref={chatRef}>
                {messages.map((msg, i) => (
                  <div key={i} className={`${styles.message} ${msg.role === "assistant" ? styles.msgSystem : styles.msgUser}`}>
                    <div className={styles.messageLabel}>
                      {msg.role === "assistant" ? "HR-9 // NPCDetect™" : "Subject Response"}
                    </div>
                    <div className={styles.messageBody}>
                      {msg.content.split("\n").map((line, j) => (
                        <span key={j}>{line}{j < msg.content.split("\n").length - 1 && <br />}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {isWaiting && (
                  <div className={styles.typing}>
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                  </div>
                )}
              </div>

              {error && <div className={styles.errorMsg}>{error}</div>}

              {!verdict && (
                <div className={styles.inputArea}>
                  <textarea
                    className={styles.textarea}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submitAnswer();
                    }}
                    placeholder="Type your response here. Take your time. We're watching."
                    rows={4}
                    disabled={isWaiting}
                  />
                  <div className={styles.inputFooter}>
                    <span className={styles.inputHint}>Ctrl+Enter to submit</span>
                    <button
                      className={styles.btnSubmit}
                      onClick={submitAnswer}
                      disabled={isWaiting || !input.trim()}
                    >
                      Submit Response →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── VERDICT SCREEN ── */}
          {screen === "verdict" && verdict && (
            <div className={styles.verdictScreen}>
              <div className={styles.verdictHeader}>
                <div className={`${styles.verdictStamp} ${styles[colorCls]}`}>
                  {verdict.stamp}
                </div>
                <h2 className={styles.verdictTitle}>{verdict.title}</h2>
                <p className={styles.verdictCase}>
                  CASE-{Math.random().toString(36).substr(2, 6).toUpperCase()} •
                  Monochromacy HR Division • {verdict.classification}
                </p>
              </div>

              <div className={styles.scoreSection}>
                <div className={styles.scoreLabel}>NPC Probability Score</div>
                <div className={`${styles.scoreNumber} ${styles[colorCls]}`}>
                  {animatedScore}%
                </div>
                <div className={styles.scoreBarTrack}>
                  <div
                    className={`${styles.scoreBarFill} ${styles[colorCls]}`}
                    style={{ width: `${verdict.score}%`, transition: "width 1.5s cubic-bezier(0.16,1,0.3,1)" }}
                  />
                </div>
                <div className={styles.tierBadge}>{verdict.classification}</div>
              </div>

              <div className={styles.findingsSection}>
                <div className={styles.findingsLabel}>Official Findings</div>
                <div className={styles.findingsBody}>
                  {verdict.findings.split("\n").map((line, i) => (
                    <span key={i}>{line}{i < verdict.findings.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
              </div>

              <div className={styles.verdictFooter}>
                <button className={styles.btnGhost} onClick={restart}>
                  Run New Screening
                </button>
                <button
                  className={styles.btnGhost}
                  onClick={() => alert("Your findings have been submitted to HR.\n\nHR has been notified.\n\nHR would like you to know they did not ask for this.\n\nThat's the Monochromacy way.")}
                >
                  Report Findings to HR
                </button>
              </div>
            </div>
          )}

        </main>

        <div className={styles.footerBar}>
          <span>NPCDetect™ is a <a href="/">Monochromacy</a> product</span>
          <span>All screenings are confidential.* <em>*They are not.</em></span>
        </div>
      </div>
    </>
  );
}
