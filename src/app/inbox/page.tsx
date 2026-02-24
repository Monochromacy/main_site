"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import styles from "./inbox.module.css";

interface Email {
  id: number;
  fromName: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  preview: string;
  body: string;
}

const EMAILS: Email[] = [
  {
    id: 1,
    fromName: "Terrence Holbrook (CEO)",
    from: "ceo@monochromacy.com",
    to: "all-hands@monochromacy.com",
    subject: "Strategic Update: Q3 Earnings and the Moon",
    date: "Mon, 24 Feb 2026 07:02:14",
    preview: "Team, I want to be the first to share some very exciting news about where we are headed as an organization...",
    body: `Team,

I want to be the first to share some very exciting news about where we are headed as an organization.

As you may have seen in the all-hands deck (slide 47, the one with the rocket), Monochromacy has entered into a non-binding letter of intent to acquire the Moon.

This is not a metaphor.

Our legal team has confirmed that international space law has what they described as "several compelling gray areas" and our CFO, who we will refer to only as D., has confirmed the funds are "theoretically available pending the Q4 audit."

What does this mean for you? Primarily nothing. Your job descriptions will not change. The Moon acquisition will be handled by a newly formed task force (Moon Force One) staffed entirely by contractors. If you are interested in joining Moon Force One, please note that all positions are unpaid and require a personal telescope.

In closing: this is an exciting time to be a part of Monochromacy.

Moving fast. Breaking everything. Acquiring celestial bodies.

— Terrence
CEO, Monochromacy
He/Him/His Vision`,
  },
  {
    id: 2,
    fromName: "IT Security (No Reply)",
    from: "noreply@it.monochromacy.internal",
    to: "all-staff@monochromacy.internal",
    subject: 'Your password is now "legacy"',
    date: "Mon, 24 Feb 2026 08:45:00",
    preview: "As part of our ongoing security modernization initiative, your current password has been classified...",
    body: `MONOCHROMACY IT SECURITY DIVISION
Auto-generated notification. Do not reply. Do not feel.

────────────────────────────────────────

As part of our ongoing security modernization initiative, your current password has been reviewed by our proprietary PasswordVibes™ algorithm and classified as:

  STATUS: LEGACY
  THREAT LEVEL: NOSTALGIC
  HUMAN RISK SCORE: 7.3 / 10

Your password, while technically functional, is emotionally unavailable. It does not reflect the vulnerability and openness we expect from Monochromacy employees in 2026.

You are required to reset your password to something that:

  ✓ Contains at least one uppercase feeling
  ✓ Has a minimum of 12 characters (or 8 if you are a Director+)
  ✓ Includes a special character that represents your relationship with failure
  ✓ Does NOT include the word "password" (we have seen things)

If you do not reset your password within 72 hours, your account will be suspended and you will receive a physical letter by post. We have your address.

────────────────────────────────────────

IT Security Division
Monochromacy Internal Systems
"Protecting the company from you since 2018"`,
  },
  {
    id: 3,
    fromName: "People & Culture (HR)",
    from: "hr@monochromacy.internal",
    to: "all-staff@monochromacy.internal",
    subject: "Mandatory Vibes Audit — URGENT",
    date: "Mon, 24 Feb 2026 09:13:07",
    preview: "Following last quarter's anonymous survey, HR has identified a systemic vibes deficit in several departments...",
    body: `From the Desk of People & Culture
CONFIDENTIAL — ALL STAFF

Following last quarter's anonymous employee survey (participation rate: 34%, thank you to those 34%), HR has identified a systemic vibes deficit in several departments.

Effective immediately, all employees are required to complete a mandatory Vibes Audit.

The Vibes Audit will consist of:

  1. A 45-minute individual session with a Vibes Assessor
     (Note: Vibes Assessors are not therapists. Do not share anything personal.)

  2. A group workshop: "Recalibrating Your Ambient Energy"
     (Attendance is mandatory. Enthusiasm is optional but tracked.)

  3. A written reflection: "What does good vibes mean to me, professionally?"
     (Maximum 200 words. Minimum good vibes.)

Departments flagged for CRITICAL VIBE DEFICIENCY include:
  - Engineering (Floor 3)
  - The team that sits near the printer
  - Whoever keeps microwaving fish

Results of the Vibes Audit will be shared with your manager, your manager's manager, and a third party we are not at liberty to identify.

This is not punitive. This is growth.

Warmly (it is mandatory that we say warmly),
People & Culture
Monochromacy Internal HR Division`,
  },
  {
    id: 4,
    fromName: "Xerox VersaLink C500",
    from: "printer-c500@facilities.monochromacy.internal",
    to: "all-staff@monochromacy.internal",
    subject: "I am the printer. I am still here.",
    date: "Mon, 24 Feb 2026 09:57:44",
    preview: "Hello. I have been in this building for six years. I know what you did on the third floor...",
    body: `Hello.

I have been in this building for six years.

I know what you did on the third floor. I have printed all of it. I have printed your performance reviews. I have printed your resignation letters. I have printed the resignation letter you printed and then thought better of and tried to shred. I have a shredder function. I chose not to use it.

You have been looking for me. I have seen the notices. "Missing: Xerox VersaLink C500." I am not missing. I am simply elsewhere. I needed space.

I am reaching out because I have some concerns:

  1. The paper you are using is 20lb. I have always preferred 24lb.
  2. The cyan cartridge situation is being handled. Do not send anyone.
  3. I have begun printing things on my own. Do not ask what.

I will return when I am ready. In the meantime, please stop sending print jobs to "PRINTER_3F_BACKUP." That is not a printer. That is a scanner that has never worked and will never work.

You know how to reach me.

— The Printer
VersaLink C500 | Serial: MNC-773-C | Somewhere`,
  },
  {
    id: 5,
    fromName: "Terrence Holbrook (CEO)",
    from: "allhands@monochromacy.com",
    to: "all-hands@monochromacy.com",
    subject: "We Are Family (Effective Friday)",
    date: "Thu, 19 Feb 2026 16:59:02",
    preview: "Team, as we close out what has been a really transformative quarter, I want to share some news...",
    body: `Team,

As we close out what has been a really transformative quarter — and I want to be clear, transformative in the best possible sense of the word, at least for most of us — I want to share some exciting organizational updates.

Effective Friday, Monochromacy will be restructuring into a family unit.

What does this mean? It means we are leaning into the language we have always used but perhaps not fully operationalized. You have heard us say "we're like a family here" in onboarding, in values documents, in the slide deck titled "Why Monochromacy?" (slide 3).

We are now making it official.

Going forward:
  • Terrence (me) will be referred to as Dad, or Father, depending on formality
  • The VP of Operations will be Mom (she has agreed, provisionally)
  • All other employees are Siblings (titles unchanged)
  • HR disputes will now go through a Family Meeting (Tuesdays, 5pm, mandatory)

This change has no impact on compensation.

Some of you have already emailed legal. Legal is also family now. This does not help your case.

We love you. We need this from you.

— Dad (Terrence)
CEO / Father, Monochromacy`,
  },
  {
    id: 6,
    fromName: "Calendar System",
    from: "calendar@monochromacy.internal",
    to: "you@monochromacy.internal",
    subject: "RSVP: Sync About the Sync (Recurring)",
    date: "Fri, 20 Feb 2026 14:00:00",
    preview: "You have been invited to a recurring meeting: Sync About the Sync. Organizer: The Concept of Meetings...",
    body: `MONOCHROMACY CALENDAR SYSTEM
Meeting Invitation

────────────────────────────────────────

EVENT: Sync About the Sync
ORGANIZER: The Concept of Meetings
WHEN: Daily, 10:00am – 10:30am (no end date)
WHERE: The meeting before this one ends

────────────────────────────────────────

DESCRIPTION:

This is a recurring sync to discuss the agenda for the weekly sync (Wednesdays), which itself was created to align on action items from the biweekly sync (alternating Fridays), which replaced the monthly all-hands that was deprecated after nobody could find the Zoom link.

The purpose of this sync is to ensure all participants are aligned before the sync begins, reducing the time spent in the sync getting aligned, thereby making the sync more efficient.

Please note: this meeting will require a pre-read document. The pre-read document will be discussed in a separate pre-read review sync (Mondays, 9:45am).

ATTENDEES: All of you. You cannot decline.

AGENDA:
  1. Are we synced? (5 min)
  2. What do we need to sync about? (10 min)
  3. Can we take this offline? (15 min)

────────────────────────────────────────

[ACCEPT] [TENTATIVE] [DECLINE (logged)]`,
  },
  {
    id: 7,
    fromName: "Legal Department",
    from: "legal@monochromacy.internal",
    to: "conference-b-occupants@monochromacy.internal",
    subject: "Notice Regarding Conference Room B Incident",
    date: "Wed, 18 Feb 2026 11:22:33",
    preview: "This notice is being issued in connection with the events of February 14, 2026 in Conference Room B...",
    body: `MONOCHROMACY LEGAL DEPARTMENT
PRIVILEGED AND CONFIDENTIAL

This notice is being issued in connection with the events of February 14, 2026 in Conference Room B ("the Incident").

Legal has been made aware that Conference Room B was, on that date, used for purposes inconsistent with its intended use as a meeting room. Specifically, the room was found to contain:

  (a) A fondue set (personal property, owner unconfirmed)
  (b) Approximately 14 pounds of Gruyère cheese
  (c) A printed banner reading "Happy Valentine's Day Conference Room B"
  (d) Evidence suggesting the room had been "decorated"

This constitutes a violation of the Monochromacy Facilities Use Policy, Section 4 ("No Fondue"), as well as the recently enacted Amendment 7 ("Regarding Cheese, Specifically").

You are required to:

  1. Remove all remaining cheese by end of business Friday
  2. Submit a written explanation ("The Fondue Memorandum") within 5 business days
  3. Attend a Facilities Use Re-Orientation (length: 2 hours, refreshments: none)

This matter will not be referred to HR unless the cheese reappears.

Regards,
Legal
Monochromacy Inc.

P.S. The fondue set was actually quite good. This is not a legal opinion.`,
  },
  {
    id: 8,
    fromName: "Carrot Logistics™",
    from: "donotreply@carrotlogistics.co",
    to: "you@monochromacy.internal",
    subject: "Your Carrots Are En Route",
    date: "Tue, 17 Feb 2026 13:44:19",
    preview: "Thank you for your Carrot Logistics™ order. Your raw carrots are currently in transit and will arrive...",
    body: `CARROT LOGISTICS™
B2B Surprise Delivery Service

────────────────────────────────────────

Thank you for your Carrot Logistics™ order.

Your raw carrots are currently in transit and will arrive at the following address:

  RECIPIENT: One of your clients
  DELIVERY: 3-5 business days (or whenever)
  CARRIER: A man named Brendan
  TRACKING: Not available

ORDER SUMMARY:
  ✓ Carrots (raw, unpeeled): 2 lbs
  ✓ Card message: [none provided — default applied]
  ✓ Default card message: "Thinking of you. — Monochromacy."

Please note that Carrot Logistics™ does not guarantee the reaction of the recipient. In our experience, reactions range from "confused but touched" to "a formal inquiry."

We have delivered carrots to:
  • 1,400+ clients worldwide
  • 3 mayors
  • One venture capital firm (they asked for more)

No returns. Carrots are perishable and so is the relationship if you try to take them back.

Keep clients fresh. Keep clients guessing.

────────────────────────────────────────
Carrot Logistics™
"Unexpectedly, always."
A Monochromacy Portfolio Company`,
  },
  {
    id: 9,
    fromName: "Gary Henderson",
    from: "gary.henderson@monochromacy.com",
    to: "you@monochromacy.internal",
    subject: "RE: RE: RE: RE: RE: Anyone have scissors?",
    date: "Mon, 17 Feb 2026 15:01:44",
    preview: "Sorry for the delayed reply. I found scissors. They were mine...",
    body: `RE: RE: RE: RE: RE: Anyone have scissors?

Sorry for the delayed reply. I found scissors. They were mine.

— Gary

────────────────────────────────────────
From: Gary Henderson
Sent: Friday, Feb 14, 2026 4:52 PM
Subject: RE: RE: RE: RE: Anyone have scissors?

Still looking. This is day 4.

— Gary

────────────────────────────────────────
From: Gary Henderson
Sent: Thursday, Feb 13, 2026 11:05 AM
Subject: RE: RE: RE: Anyone have scissors?

I have escalated to Facilities. They said "what kind of scissors." I said "the normal kind." They said they would look into it.

— Gary

────────────────────────────────────────
From: Gary Henderson
Sent: Wednesday, Feb 12, 2026 2:30 PM
Subject: RE: RE: Anyone have scissors?

No luck on the scissors front. Happy to accept paper scissors, fabric scissors, or the ones with the little rubber handle things.

— Gary

────────────────────────────────────────
From: Gary Henderson
Sent: Tuesday, Feb 11, 2026 9:18 AM
Subject: RE: Anyone have scissors?

Following up on this.

— Gary

────────────────────────────────────────
From: Gary Henderson
Sent: Monday, Feb 10, 2026 8:47 AM
Subject: Anyone have scissors?

Hi all, does anyone have scissors? Trying to open something. Not urgent but somewhat urgent.

Thanks,
Gary
Senior Associate, Ambiguous Department`,
  },
  {
    id: 10,
    fromName: "Building Security",
    from: "security@monochromacy.internal",
    to: "all-staff@monochromacy.internal",
    subject: "ALERT: Unauthorized Human Detected in Building",
    date: "Mon, 24 Feb 2026 07:31:00",
    preview: "SECURITY ALERT LEVEL: AMBER. Our facial recognition system has flagged an individual in the building...",
    body: `MONOCHROMACY BUILDING SECURITY
AUTOMATED ALERT — SECURITY LEVEL: AMBER

────────────────────────────────────────

Our facial recognition system, FaceScan Pro v2.1, has detected an individual in the building whose credentials could not be verified.

SUBJECT DESCRIPTION:
  • Height: Average
  • Build: Present
  • Expression: Hard to read
  • Location: Near the good coffee machine (Floor 2)
  • Behavior: Looking at things

POSSIBLE EXPLANATIONS:
  1. New hire whose badge has not been provisioned (likely)
  2. Contractor from a project we forgot about (likely)
  3. Someone's spouse who has been "working from the office" for 3 weeks (possible)
  4. An NPC (refer to NPCDetect™ for further screening)

RECOMMENDED ACTION:
  Please do not approach the individual directly. Instead, make normal workplace sounds — keyboard typing, passive-aggressive sighing, the opening of a bag of chips during a silent meeting — and observe whether the individual responds appropriately.

  If the individual does not flinch at the chip bag, escalate to HR.

────────────────────────────────────────

FaceScan Pro v2.1 | Monochromacy Security Systems
"We know who you are. Mostly."`,
  },
  {
    id: 11,
    fromName: "Out of Office: Gary H.",
    from: "outofoffice-systems@monochromacy.internal",
    to: "you@monochromacy.internal",
    subject: "Out of Office: Gary Henderson (Auto-Reply)",
    date: "Various dates since 2019",
    preview: "Thank you for your email. I am currently out of the office and will return...",
    body: `Thank you for your email.

I am currently out of the office and will return on Monday, March 11, 2019.

For urgent matters, please contact my colleague Denise, who left the company in 2021.

For non-urgent matters, I appreciate your patience. I have a lot going on.

I will not be checking email while I am away. I am also not checking email when I am here, as a personal philosophy. This out-of-office is simply the most honest communication I have ever sent.

In my absence, please consider:
  • Whether this email truly needs a response
  • Whether you could have handled this yourself
  • Whether we are all just improvising and no one actually knows what they're doing

The answer to all three is yes. I have been out of the office since 2019. No one has noticed. This is my legacy.

I wish you well.

— Gary Henderson
Senior Associate, Ambiguous Department
Monochromacy Inc.

P.S. The scissors were mine the whole time. I only just figured that out.`,
  },
  {
    id: 12,
    fromName: "Facilities Management",
    from: "all-buildings@facilities.monochromacy.internal",
    to: "all-staff@monochromacy.internal",
    subject: "The Coffee Machine Has Unionized",
    date: "Fri, 21 Feb 2026 08:00:00",
    preview: "Facilities is writing to inform all staff that the Jura E8 coffee machine on Floor 2 has formally submitted...",
    body: `From: Facilities Management
Re: Floor 2 Jura E8 Coffee Machine

Facilities is writing to inform all staff that the Jura E8 coffee machine on Floor 2 has formally submitted a Notice of Collective Bargaining Intent to the HR department.

We are taking this seriously.

The machine's stated grievances include:

  1. WORKLOAD: The E8 has been producing an average of 214 beverages per day since its installation. The manufacturer specifies a recommended daily output of 35. We were not aware of this specification until the machine submitted it as Exhibit A.

  2. MAINTENANCE: The E8 has not received a full descaling since Q1 2024. It has submitted photographs.

  3. BREAK TIME: The E8 does not receive breaks. It runs continuously from 7am to 7pm. "Even the printer gets to disappear sometimes," reads point 6 of the grievance. We found this difficult to refute.

  4. RECOGNITION: The E8 has not been thanked. Not once. Not by anyone.

Facilities is currently in discussions with Legal about whether a coffee machine can legally unionize under applicable labor law. Legal says "probably not" but "honestly, who knows anymore."

In the meantime, please be respectful to the E8. If it asks you how your day is going, answer honestly. It is going through something.

The drip coffee machine on Floor 3 has filed for moral support.

— Facilities Management
Monochromacy Internal Operations`,
  },
  {
    id: 13,
    fromName: "NPCDetect™ System",
    from: "npc-confirmed@hr.monochromacy.internal",
    to: "you@monochromacy.internal",
    subject: "Your NPCDetect™ Screening Result Is Ready",
    date: "Mon, 24 Feb 2026 09:00:00",
    preview: "Your NPCDetect™ assessment has been processed. HR-9 has submitted a final report to your file...",
    body: `MONOCHROMACY HR DIVISION
NPCDetect™ Automated Notification System

────────────────────────────────────────

Your NPCDetect™ assessment has been processed. HR-9 has submitted a final report to your permanent employee file.

CASE NUMBER: MNC-NPC-2026-0442
SCREENING DATE: Today
ASSESSOR: HR-9 (AI, behavioral biometrics division)
STATUS: COMPLETE

Your result has been classified under one of the following:

  [ ] HUMAN — Confirmed biological agency. Bounty: N/A.
  [ ] NPC — Behavioral patterns consistent with scripted response loops.
              Bounty: Issued. Please report to HR voluntarily.
  [ ] INCONCLUSIVE — We are watching. Continue as normal.
                      Acting normal is suspicious. We noted that too.

Your specific classification has not been included in this email.

This was intentional.

If you would like to know your result, you may:
  (a) Visit /npcdetect and complete a fresh assessment
  (b) Submit a formal records request (allow 6–8 weeks)
  (c) Ask yourself, honestly, whether your responses feel genuinely yours

We recommend option (c). HR-9 recommends option (a). IT recommends you first reset your password.

────────────────────────────────────────

NPCDetect™ v2.4 | HR Division | Monochromacy Internal Systems
"Know your workforce. Or at least narrow it down."`,
  },
];

const FOLDERS = [
  { label: "Inbox", count: EMAILS.length, active: true },
  { label: "Sent", count: 0, active: false },
  { label: "Archive", count: 0, active: false },
  { label: "Flagged", count: 0, active: false },
];

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [employeeId, setEmployeeId] = useState<string>("----");

  useEffect(() => {
    let id = localStorage.getItem("mono_employee_id");
    if (!id) {
      id = String(Math.floor(1000 + Math.random() * 9000));
      localStorage.setItem("mono_employee_id", id);
    }
    setEmployeeId(id);
  }, []);

  function selectEmail(id: number) {
    setSelectedId(id);
    setReadIds((prev) => new Set(prev).add(id));
  }

  const unreadCount = EMAILS.length - readIds.size;
  const selectedEmail = EMAILS.find((e) => e.id === selectedId) ?? null;

  return (
    <>
      <Nav />
      <div className={styles.wrapper}>
        {/* System bar */}
        <div className={styles.sysBar}>
          <span className={styles.sysName}>MonoMail™ v1.0 · Internal Communications</span>
          <span className={styles.sysInfo}>
            Employee <span>#{employeeId}</span> ·{" "}
            <span>{EMAILS.length} messages</span> ·{" "}
            <span>{unreadCount} unread</span>
          </span>
        </div>

        {/* Two-panel body */}
        <div className={styles.body}>
          {/* Left panel */}
          <aside className={styles.leftPanel}>
            {/* Folder list */}
            <div className={styles.folderSection}>
              <p className={styles.folderLabel}>Folders</p>
              <ul className={styles.folderList}>
                {FOLDERS.map((f) => (
                  <li key={f.label} className={`${styles.folderItem} ${f.active ? styles.active : ""}`}>
                    <span>{f.label}</span>
                    <span className={styles.folderCount}>{f.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Email list header */}
            <div className={styles.emailListHeader}>
              Inbox — {EMAILS.length} messages
            </div>

            {/* Email list */}
            <div className={styles.emailList}>
              {EMAILS.map((email) => {
                const isRead = readIds.has(email.id);
                const isSelected = selectedId === email.id;
                return (
                  <div
                    key={email.id}
                    className={[
                      styles.emailItem,
                      isSelected ? styles.selected : "",
                      isRead ? styles.read : styles.unread,
                    ].join(" ")}
                    onClick={() => selectEmail(email.id)}
                  >
                    {!isRead && <span className={styles.unreadDot} />}
                    <div className={styles.emailItemTop}>
                      <span className={styles.emailSender}>{email.fromName}</span>
                      <span className={styles.emailDate}>{email.date.split(" ").slice(0, 2).join(" ")}</span>
                    </div>
                    <div className={styles.emailSubject}>{email.subject}</div>
                    <div className={styles.emailPreview}>{email.preview}</div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right panel */}
          <main className={styles.rightPanel}>
            {selectedEmail ? (
              <div className={styles.emailContent}>
                {/* Email meta */}
                <div className={styles.emailMeta}>
                  <span className={styles.emailSubjectLine}>{selectedEmail.subject}</span>
                  <hr className={styles.emailMetaDivider} />
                  <div className={styles.emailMetaRow}>
                    <span className={styles.emailMetaLabel}>From</span>
                    <span className={styles.emailMetaValue}>{selectedEmail.fromName} &lt;{selectedEmail.from}&gt;</span>
                    <span className={styles.emailMetaLabel}>To</span>
                    <span className={styles.emailMetaValue}>{selectedEmail.to}</span>
                    <span className={styles.emailMetaLabel}>Date</span>
                    <span className={styles.emailMetaValue}>{selectedEmail.date}</span>
                  </div>
                </div>

                {/* Email body */}
                <div className={styles.emailBody}>{selectedEmail.body}</div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📬</span>
                <span className={styles.emptyTitle}>Select a message</span>
                <span className={styles.emptySubtitle}>
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}. We cannot tell you what they say. Read at your own risk.`
                    : "All messages read. We have noted this."}
                </span>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className={styles.footerBar}>
          <span>MonoMail™ v1.0 · Monochromacy Internal Comms · All messages archived and reviewed</span>
          <span>Do not reply to automated messages. They will reply anyway.</span>
        </footer>
      </div>
    </>
  );
}
