"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import styles from "./portal.module.css";

interface AppDef {
  id: string;
  icon: string;
  name: string;
  dept: string;
  status: "LIVE" | "Q3" | "Q4";
  desc: string;
  link: string | null;
  version: string | null;
  tag?: string;
}

const APPS: AppDef[] = [
  {
    id: "npcdetect",
    icon: "🤖",
    name: "NPCDetect™",
    dept: "HR Division",
    status: "LIVE",
    desc: "AI-powered workforce screening. Identifies non-player characters using behavioral biometrics, dialogue analysis, and vibes. Bounties issued upon confirmation.",
    link: "/npcdetect",
    version: "v2.4",
    tag: "AI Tool",
  },
  {
    id: "officeodyssey",
    icon: "🎰",
    name: "OfficeOdyssey™",
    dept: "Facilities",
    status: "LIVE",
    desc: "Workplace navigation training suite. Employees learn to locate the exit. Success rate is classified and will not be disclosed at this time.",
    link: "/officeodyssey",
    version: "v1.0",
    tag: "Interactive",
  },
  {
    id: "agileforce",
    icon: "🪖",
    name: "AgileForce™ Morning Protocol",
    dept: "Physical Readiness",
    status: "LIVE",
    desc: "NATO-certified obstacle course simulation. Complete before your 9am standup. All results are logged. Some results have been referred to HR.",
    link: "/agileforce",
    version: "v1.1",
    tag: "Training",
  },
  {
    id: "versa",
    icon: "🖨️",
    name: "VersaLink Recovery Unit™",
    dept: "IT / Legal",
    status: "Q3",
    desc: "Active investigation platform for recovery of the missing Xerox VersaLink C500. Status: ongoing. Do not ask about the printer.",
    link: null,
    version: null,
    tag: "Investigation",
  },
  {
    id: "preachbreach",
    icon: "🛡️",
    name: "PreachBreachPro™",
    dept: "Risk Mitigation",
    status: "Q3",
    desc: "Proactive data disclosure platform. Leak your own sensitive data on your schedule, with full branding and a press release template.",
    link: null,
    version: null,
    tag: "Security",
  },
  {
    id: "carrot",
    icon: "🥕",
    name: "Carrot Logistics™",
    dept: "Client Relations",
    status: "Q3",
    desc: "B2B surprise delivery service. We send raw carrots to your clients for absolutely no reason. Keeps relationships fresh. Keeps clients guessing.",
    link: null,
    version: null,
    tag: "Logistics",
  },
  {
    id: "underbus",
    icon: "🚌",
    name: "Under the Bus™",
    dept: "Talent Management",
    status: "Q4",
    desc: "Interactive workforce accountability simulation. 17 sessions completed YTD. 9 participants survived with minor injuries. 2 are no longer with us.",
    link: null,
    version: null,
    tag: "Simulation",
  },
];

export default function Portal() {
  const [employeeId, setEmployeeId] = useState<string>("----");
  const [sessionStart] = useState(() => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));

  useEffect(() => {
    let id = localStorage.getItem("mono_employee_id");
    if (!id) {
      id = String(Math.floor(1000 + Math.random() * 9000));
      localStorage.setItem("mono_employee_id", id);
    }
    setEmployeeId(id);
  }, []);

  const liveApps = APPS.filter((a) => a.status === "LIVE");
  const lockedApps = APPS.filter((a) => a.status !== "LIVE");

  return (
    <>
      <Nav />
      <div className={styles.wrapper}>

        {/* System bar */}
        <div className={styles.sysBar}>
          <span className={styles.sysName}>MONOCHROMACY INTERNAL SYSTEMS · MonoNet v3.1.4</span>
          <span className={styles.sysUser}>
            Employee #{employeeId} · DEPT: UNCLASSIFIED · SESSION: {sessionStart}
          </span>
        </div>

        <main className={styles.main}>

          {/* Portal header */}
          <div className={styles.portalHeader}>
            <div className={styles.portalTitleGroup}>
              <p className={styles.portalLabel}>Authorized Personnel Only</p>
              <h1 className={styles.portalTitle}>Application Launcher</h1>
            </div>
            <p className={styles.portalSub}>
              Select an authorized application to begin your session. Unauthorized access is logged,
              flagged, and honestly kind of appreciated. That&apos;s the Monochromacy way.
            </p>
          </div>

          {/* Live apps */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionDot} />
              Active Applications
              <span className={styles.sectionCount}>{liveApps.length} available</span>
            </div>
            <div className={styles.appGrid}>
              {liveApps.map((app) => (
                <Link key={app.id} href={app.link!} className={styles.appLink}>
                  <AppCard app={app} />
                </Link>
              ))}
            </div>
          </div>

          {/* Locked apps */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionDotLocked} />
              Pending Deployment
              <span className={styles.sectionCount}>{lockedApps.length} in pipeline</span>
            </div>
            <div className={styles.appGrid}>
              {lockedApps.map((app) => (
                <div key={app.id} className={styles.appLinkDisabled}>
                  <AppCard app={app} />
                </div>
              ))}
            </div>
          </div>

        </main>

        <footer className={styles.portalFooter}>
          <span>MonoNet v3.1.4 · Monochromacy Internal Systems · All activity monitored</span>
          <span>For IT support, submit a ticket. IT has not responded to tickets since 2022.</span>
        </footer>
      </div>
    </>
  );
}

function AppCard({ app }: { app: AppDef }) {
  const isLive = app.status === "LIVE";

  return (
    <div className={`${styles.appCard} ${!isLive ? styles.appCardLocked : ""}`}>
      <div className={styles.appCardTop}>
        <div className={styles.appIconWrap}>
          <span className={styles.appIcon}>{app.icon}</span>
        </div>
        <div className={styles.appMeta}>
          {app.tag && <span className={styles.appTag}>{app.tag}</span>}
          <span className={`${styles.appStatus} ${isLive ? styles.statusLive : styles.statusSoon}`}>
            {isLive ? "● LIVE" : `COMING ${app.status}`}
          </span>
        </div>
      </div>

      <div className={styles.appCardBody}>
        <p className={styles.appDept}>{app.dept}</p>
        <h3 className={styles.appName}>{app.name}</h3>
        {app.version && <span className={styles.appVersion}>{app.version}</span>}
        <p className={styles.appDesc}>{app.desc}</p>
      </div>

      <div className={styles.appCardFooter}>
        {isLive ? (
          <span className={styles.launchBtn}>Launch Application →</span>
        ) : (
          <span className={styles.lockedBtn}>Access Restricted</span>
        )}
      </div>
    </div>
  );
}
