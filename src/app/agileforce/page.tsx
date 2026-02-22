"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Nav from "@/components/Nav";
import styles from "./agileforce.module.css";

type Screen = "briefing" | "select" | "countdown" | "playing" | "results";
type ObstacleType = "execute" | "wait" | "multi";
type ResultType = "hit" | "miss";

interface Obstacle {
  label: string;
  instruction: string;
  subLabel: string;
  type: ObstacleType;
}

interface Difficulty {
  id: string;
  label: string;
  subLabel: string;
  count: number;
  windowMs: number;
}

const OBSTACLE_POOL: Obstacle[] = [
  { label: "DUCK", instruction: "EXECUTE", subLabel: "Get low. Stay low.", type: "execute" },
  { label: "JUMP", instruction: "EXECUTE", subLabel: "Clear the obstacle.", type: "execute" },
  { label: "LOW CRAWL", instruction: "EXECUTE", subLabel: "Elbows. Use your elbows.", type: "execute" },
  { label: "PIVOT", instruction: "EXECUTE", subLabel: "Change direction. Immediately.", type: "execute" },
  { label: "CIRCLE BACK", instruction: "EXECUTE", subLabel: "Return to previous position.", type: "execute" },
  {
    label: "LEVERAGE SYNERGIES",
    instruction: "CLICK × 3 RAPIDLY",
    subLabel: "Corporate muscle memory.",
    type: "multi",
  },
  {
    label: "TAKE IT OFFLINE",
    instruction: "DO NOTHING",
    subLabel: "The correct answer is inaction. Wait for it to pass.",
    type: "wait",
  },
];

const DIFFICULTIES: Difficulty[] = [
  { id: "standard", label: "Standard", subLabel: "Monday morning", count: 8, windowMs: 1500 },
  { id: "extreme", label: "Extreme", subLabel: "Sprint planning day", count: 12, windowMs: 900 },
  { id: "audited", label: "We're Being Audited", subLabel: "Self-explanatory", count: 15, windowMs: 600 },
];

function generateObstacles(count: number): Obstacle[] {
  const execute = OBSTACLE_POOL.filter((o) => o.type === "execute");
  const special = OBSTACLE_POOL.filter((o) => o.type !== "execute");

  // Always include at least one of each special obstacle
  const required = [...special];
  const remaining = Math.max(0, count - required.length);

  const fill: Obstacle[] = [];
  for (let i = 0; i < remaining; i++) {
    fill.push(execute[Math.floor(Math.random() * execute.length)]);
  }

  const all = [...required, ...fill];
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

function computeGrade(results: ResultType[], difficultyId: string): string {
  const hits = results.filter((r) => r === "hit").length;
  const rate = hits / results.length;

  if (difficultyId === "audited") {
    return rate >= 0.6 ? "AUDITED — COMPLIANT" : "AUDITED — NON-COMPLIANT";
  }
  if (rate >= 0.8) return "PASSED";
  if (rate >= 0.6) return "FAILED";
  return "FAILED (NOTED)";
}

export default function AgileForce() {
  const [screen, setScreen] = useState<Screen>("briefing");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<ResultType[]>([]);
  const [countdownValue, setCountdownValue] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);
  const [multiCount, setMultiCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processingRef = useRef(false);

  const currentObstacle = obstacles[currentIdx] ?? null;

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const advanceObstacle = useCallback(
    (result: ResultType) => {
      if (processingRef.current) return;
      processingRef.current = true;
      clearTimer();

      setFeedback(result);
      const newResults = [...results, result];

      setTimeout(() => {
        setFeedback(null);
        processingRef.current = false;

        if (currentIdx + 1 >= obstacles.length) {
          setResults(newResults);
          setScreen("results");
        } else {
          setResults(newResults);
          setCurrentIdx((i) => i + 1);
          setMultiCount(0);
          startObstacleTimer();
        }
      }, 350);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIdx, obstacles, results]
  );

  function startObstacleTimer() {
    if (!difficulty) return;
    clearTimer();
    setTimeRemaining(difficulty.windowMs);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 16;
        if (next <= 0) {
          clearTimer();
          return 0;
        }
        return next;
      });
    }, 16);
  }

  // Handle timer expiry
  useEffect(() => {
    if (screen !== "playing" || timeRemaining > 0 || processingRef.current) return;
    if (!currentObstacle) return;

    // Time ran out
    if (currentObstacle.type === "wait") {
      advanceObstacle("hit"); // Doing nothing = correct
    } else {
      advanceObstacle("miss"); // Ran out of time = miss
    }
  }, [timeRemaining, screen, currentObstacle, advanceObstacle]);

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), []);

  function selectDifficulty(diff: Difficulty) {
    setDifficulty(diff);
    const obs = generateObstacles(diff.count);
    setObstacles(obs);
    setCurrentIdx(0);
    setResults([]);
    setMultiCount(0);
    setScreen("countdown");
    startCountdown(diff);
  }

  function startCountdown(diff: Difficulty) {
    let count = 3;
    setCountdownValue(count);
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdownValue(0);
        setTimeout(() => {
          setScreen("playing");
          setTimeRemaining(diff.windowMs);

          timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
              const next = prev - 16;
              if (next <= 0) {
                clearTimer();
                return 0;
              }
              return next;
            });
          }, 16);
        }, 400);
      } else {
        setCountdownValue(count);
      }
    }, 900);
  }

  function handleExecute() {
    if (screen !== "playing" || !currentObstacle || processingRef.current) return;

    if (currentObstacle.type === "wait") {
      advanceObstacle("miss"); // Pressed = wrong for TAKE IT OFFLINE
    } else if (currentObstacle.type === "multi") {
      const newCount = multiCount + 1;
      if (newCount >= 3) {
        setMultiCount(0);
        advanceObstacle("hit");
      } else {
        setMultiCount(newCount);
      }
    } else {
      advanceObstacle("hit");
    }
  }

  // Keyboard support
  useEffect(() => {
    if (screen !== "playing") return;
    function onKey(e: KeyboardEvent) {
      if (["Enter", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        handleExecute();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function restart() {
    clearTimer();
    processingRef.current = false;
    setScreen("briefing");
    setDifficulty(null);
    setObstacles([]);
    setCurrentIdx(0);
    setResults([]);
    setCountdownValue(3);
    setTimeRemaining(0);
    setFeedback(null);
    setMultiCount(0);
  }

  const grade = difficulty ? computeGrade(results, difficulty.id) : "";
  const hitCount = results.filter((r) => r === "hit").length;
  const hitRate = results.length > 0 ? Math.round((hitCount / results.length) * 100) : 0;
  const gradeColor =
    grade.includes("PASSED") || grade === "AUDITED — COMPLIANT"
      ? "#5ab87e"
      : grade.includes("NOTED")
      ? "#e05a5a"
      : "#c8b560";

  const timerPct = difficulty ? (timeRemaining / difficulty.windowMs) * 100 : 0;

  return (
    <>
      <Nav />
      <div className={styles.wrapper}>

        {/* Header bar */}
        <div className={styles.headerBar}>
          <div className={styles.logoGroup}>
            <span className={styles.logoIcon}>🪖</span>
            <span className={styles.logoText}>AgileForce<span>™</span></span>
          </div>
          <div className={styles.headerMeta}>
            Monochromacy Physical Readiness Division · NATO Morning Protocol v1.1
          </div>
          <div className={styles.headerRight}>
            {screen === "playing" && difficulty && (
              <span className={styles.diffBadge}>{difficulty.label}</span>
            )}
          </div>
        </div>

        <main className={styles.main}>

          {/* ── BRIEFING ── */}
          {screen === "briefing" && (
            <div className={styles.briefingScreen}>
              <div className={styles.briefingEmblem}>🪖</div>
              <p className={styles.briefingTag}>Monochromacy — Physical Readiness Division</p>
              <h1 className={styles.briefingTitle}>
                AgileForce<span>™</span>
              </h1>
              <p className={styles.briefingSubtitle}>NATO Morning Protocol</p>

              <div className={styles.briefingBody}>
                <p>
                  Good morning, Employee. Today&apos;s obstacle course is mandatory.
                  At Monochromacy, being agile is a critical part of our business&apos;s success.
                </p>
                <p>
                  Commands will appear on screen. Execute them before the timer expires.
                  Some commands require action. One requires inaction.
                  The building is watching. HR has been notified.
                </p>
                <p>
                  Your score will be added to your permanent record.
                  Results may be referenced in future performance reviews, bounty issuances,
                  or bus-related incidents.
                </p>
              </div>

              <div className={styles.disclaimer}>
                <strong>PHYSICAL READINESS NOTICE:</strong> Failure to complete the morning protocol
                will result in your standup being rescheduled. Your standup cannot be rescheduled.{" "}
                <strong>That&apos;s the Monochromacy way.</strong>
              </div>

              <button className={styles.btnPrimary} onClick={() => setScreen("select")}>
                Proceed to Difficulty Selection →
              </button>
            </div>
          )}

          {/* ── DIFFICULTY SELECT ── */}
          {screen === "select" && (
            <div className={styles.selectScreen}>
              <p className={styles.selectLabel}>Select Course Difficulty</p>
              <h2 className={styles.selectTitle}>How ready are you?</h2>
              <div className={styles.diffGrid}>
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.id}
                    className={`${styles.diffCard} ${diff.id === "audited" ? styles.diffCardAudited : ""}`}
                    onClick={() => selectDifficulty(diff)}
                  >
                    <div className={styles.diffLabel}>{diff.label}</div>
                    <div className={styles.diffSub}>{diff.subLabel}</div>
                    <div className={styles.diffStats}>
                      <span>{diff.count} obstacles</span>
                      <span>{(diff.windowMs / 1000).toFixed(1)}s per obstacle</span>
                    </div>
                  </button>
                ))}
              </div>
              <button className={styles.btnGhost} onClick={() => setScreen("briefing")}>
                ← Back to Briefing
              </button>
            </div>
          )}

          {/* ── COUNTDOWN ── */}
          {screen === "countdown" && (
            <div className={styles.countdownScreen}>
              <div className={styles.countdownNumber}>
                {countdownValue > 0 ? countdownValue : "GO"}
              </div>
              <p className={styles.countdownSub}>
                {countdownValue > 0 ? "Course begins in..." : "Move."}
              </p>
            </div>
          )}

          {/* ── PLAYING ── */}
          {screen === "playing" && currentObstacle && difficulty && (
            <div
              className={`${styles.playingScreen} ${
                feedback === "hit" ? styles.feedbackHit : feedback === "miss" ? styles.feedbackMiss : ""
              }`}
            >
              {/* Progress */}
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${((currentIdx) / obstacles.length) * 100}%` }}
                />
              </div>
              <div className={styles.progressLabel}>
                Obstacle {currentIdx + 1} of {obstacles.length}
              </div>

              {/* Obstacle card */}
              <div className={styles.obstacleCard}>
                <div className={styles.obstacleLabel}>
                  {currentObstacle.type === "wait" ? "⚠ HOLD POSITION" : "OBSTACLE DETECTED"}
                </div>
                <div className={styles.obstacleCommand}>{currentObstacle.label}</div>
                <div className={styles.obstacleSubLabel}>{currentObstacle.subLabel}</div>
                <div className={styles.obstacleInstruction}>
                  {currentObstacle.type === "multi"
                    ? `${currentObstacle.instruction} (${multiCount}/3)`
                    : currentObstacle.instruction}
                </div>
              </div>

              {/* Timer bar */}
              <div className={styles.timerTrack}>
                <div
                  className={`${styles.timerFill} ${timerPct < 25 ? styles.timerDanger : ""}`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>

              {/* Action button (hidden for WAIT obstacles) */}
              {currentObstacle.type !== "wait" && (
                <button
                  className={styles.btnExecute}
                  onClick={handleExecute}
                  disabled={!!feedback}
                >
                  {currentObstacle.type === "multi"
                    ? `EXECUTE (${multiCount}/3)`
                    : "EXECUTE"}
                </button>
              )}

              {currentObstacle.type === "wait" && (
                <div className={styles.waitNote}>Do not press anything. Wait.</div>
              )}

              {/* Feedback overlay */}
              {feedback && (
                <div className={`${styles.feedbackLabel} ${feedback === "hit" ? styles.feedbackLabelHit : styles.feedbackLabelMiss}`}>
                  {feedback === "hit" ? "✓ CLEARED" : "✗ NOTED"}
                </div>
              )}
            </div>
          )}

          {/* ── RESULTS ── */}
          {screen === "results" && difficulty && (
            <div className={styles.resultsScreen}>
              <p className={styles.resultsTag}>Course Complete</p>
              <div className={styles.gradeDisplay} style={{ color: gradeColor, borderColor: gradeColor }}>
                {grade}
              </div>
              <h2 className={styles.resultsTitle}>
                {hitRate >= 80
                  ? "Your agility has been noted favorably."
                  : hitRate >= 60
                  ? "Your agility has been noted."
                  : "Your agility has been noted unfavorably."}
              </h2>

              <div className={styles.statsGrid}>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Obstacles Cleared</div>
                  <div className={styles.statValue} style={{ color: gradeColor }}>
                    {hitCount} / {results.length}
                  </div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Success Rate</div>
                  <div className={styles.statValue} style={{ color: gradeColor }}>
                    {hitRate}%
                  </div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Difficulty</div>
                  <div className={styles.statValue}>{difficulty.label}</div>
                </div>
              </div>

              {/* Obstacle breakdown */}
              <div className={styles.breakdown}>
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`${styles.breakdownPip} ${r === "hit" ? styles.pipHit : styles.pipMiss}`}
                    title={`${obstacles[i]?.label}: ${r}`}
                  />
                ))}
              </div>

              <div className={styles.resultsNote}>
                Your results have been submitted to HR. HR has been notified.
                Your 9am standup is now in progress. You are late.
              </div>

              <div className={styles.resultsActions}>
                <button className={styles.btnPrimary} onClick={restart}>
                  Run Again
                </button>
                <a href="/portal" className={styles.btnGhost}>
                  Back to Portal
                </a>
              </div>
            </div>
          )}

        </main>

        <div className={styles.footerBar}>
          <span>AgileForce™ is a <a href="/">Monochromacy</a> Physical Readiness product</span>
          <span>All results are final. All results are logged. That&apos;s the Monochromacy way.</span>
        </div>
      </div>
    </>
  );
}
