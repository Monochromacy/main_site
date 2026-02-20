import Nav from "@/components/Nav";
import styles from "./page.module.css";

const tweets = [
  {
    id: 1,
    body: `When our employees told us they'd rather continue working remotely than come back to the office, we hired a team of mercenaries to bring them back in anyways.\n\nThat's the Monochromacy way.`,
    tags: "#innovation #culture #gamechanging #innovationculture",
    featured: true,
  },
  {
    id: 2,
    body: `Today we announced our org-wide NPC bounty initiative. If an employee can prove that one of their colleagues is an NPC, that employee will receive a week of PTO & a unique Monochromacy NFT.\n\nInsecurity, that's the Monochromacy way.`,
    tags: "#innovation #team #ai #npc #leadership #HR",
  },
  {
    id: 3,
    body: `We have preemptively leaked all our company's data as part of our 2023 risk mitigation strategy. TIN's, SSN's, EIN's, our Wi-Fi password, the whole deal.\n\nTransparency, that's the Monochromacy way.`,
    tags: "#data #strategy #innovation #leak #breachprevention",
  },
  {
    id: 4,
    body: `To whoever stole our Xerox VersaLink C500 laser printer, we know who you are and we will find you.`,
    tags: "",
  },
  {
    id: 5,
    body: `At Monochromacy, being #agile is a critical part of our business's success. That's why every morning our employees complete a NATO standardized obstacle course before starting the day.\n\nThat's the Monochromacy way.`,
    tags: "#agilemindset #agilescrum #agilemethodologies #agileleadership",
  },
  {
    id: 6,
    body: `Here at Monochromacy.co, our employees come first. That's why once a month each of our team members is allowed to swear under their breath during a client meeting.\n\nThat's the Monochromacy way.`,
    tags: "#innovation #employeeperks #workculture #corporateculture",
  },
  {
    id: 7,
    body: `When we remodeled our office, our contractor asked if we had any specific requirements. We simply said: Make it like a casino. We don't want them to know what time it is or how to get out.\n\nThat's the Monochromacy way.`,
    tags: "#officelife #officedesign #officeculture #innovation",
    featured: true,
  },
  {
    id: 8,
    body: `We fired our data engineer. They proposed we use data and analytics to better inform our decision making. But at Monochromacy we know better. Once you give the computers that kind of power, that's how Skynet happens. Not on our watch.`,
    tags: "#data #skynet #analytics #innovation",
  },
  {
    id: 9,
    body: `Year to date, 17 of our employees have been thrown under the bus. 9 survived with minor injuries, 6 were considered to be in critical condition and 2 are no longer with us.\n\nThat's the Monochromacy way.`,
    tags: "#innovation #teamculture #workplaceculture #monochromacy",
  },
  {
    id: 10,
    body: `We just sent seven pallets of raw carrots to one of our autoparts manufacturing customers for absolutely no reason at all.\n\nUnpredictability, that's the Monochromacy way.`,
    tags: "#innovation #service #thinkingdifferently #deliver",
  },
  {
    id: 11,
    body: `At Monochromacy we take our analysis and research to the next level. When we take a deep dive, we mean it literally... we recently purchased a submarine and everything.\n(We wear sailor outfits, it's fun.)\n\nThat's the Monochromacy way.`,
    tags: "#deepdive #analysis #analyze #innovation",
  },
  {
    id: 12,
    body: `We're ecstatic to announce Shannon Miller will be joining our executive team as our Chief Lasagna Officer. Although her background is in finance, she once was a server at an Olive Garden in South Dakota, and based solely on that factoid alone we were sold!\n\nWelcome Shannon!`,
    tags: "#welcome #welcometotheteam #leadershipteam #companygrowth #innovation #newhire",
    featured: true,
  },
];

const tickerItems = [
  "INNOVATION","DISRUPTION","SYNERGY","AGILITY","THOUGHT LEADERSHIP",
  "PARADIGM SHIFTS","DEEP DIVES","LEVERAGE","SCALABILITY","CIRCLE BACK",
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <p className={styles.heroEyebrow}>Fortune 500-Adjacent™ Company</p>
            <h1 className={styles.heroHeadline}>
              Moving Fast,<br />
              <em>Breaking Everything.</em>
            </h1>
            <p className={styles.heroSub}>
              At Monochromacy, we don&apos;t just disrupt industries — we disrupt the very
              concept of disruption itself. We&apos;re business-pilled, innovation-forward,
              and agility-positive. That&apos;s the Monochromacy way.
            </p>
            <div className={styles.heroCtas}>
              <a href="/innovations" className={styles.btnPrimary}>Our Innovations</a>
              <a href="#about" className={styles.btnOutline}>Learn More</a>
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroBadge}>
              <div className={styles.heroBadgeInner}>
                <div className={styles.badgeIcon}>🏆</div>
                <div className={styles.badgeText}>Award Eligible</div>
                <div className={styles.badgeSub}>Self-Nominated • Est. 2020</div>
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <div className={styles.ticker}>
          <div className={styles.tickerInner}>
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i}>{i % 2 === 0 ? item : "•"}</span>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        <section id="about" className={styles.about}>
          <p className={styles.sectionLabel}>Who We Are</p>
          <div className={styles.missionGrid}>
            <div>
              <h2 className={styles.missionHeadline}>
                We&apos;re not just a company.<br />
                <em>We&apos;re a way of life.</em>
              </h2>
              <div className={styles.divider} />
              <p className={styles.missionText}>
                Monochromacy was founded on a single, immutable truth: most companies
                are doing it wrong. Not completely wrong — just wrong enough that we
                could do it worse and call it a differentiator.
              </p>
              <p className={styles.missionText}>
                Our leadership team brings together decades of combined experience in
                industries we&apos;d rather not name, and our culture has been described by
                departing employees as &ldquo;genuinely confusing.&rdquo; We wear that as a badge
                of honor.
              </p>
            </div>
            <div className={styles.statsGrid}>
              {[
                { number: "17", label: "Employees thrown under bus YTD" },
                { number: "1", label: "Submarine owned (for deep dives)" },
                { number: "7", label: "Pallets of carrots delivered" },
                { number: "0", label: "Data breaches remaining (preemptive)" },
              ].map((stat) => (
                <div key={stat.label} className={styles.statBox}>
                  <div className={styles.statNumber}>{stat.number}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TWEETS */}
        <section id="tweets" className={styles.tweets}>
          <div className={styles.tweetsHeader}>
            <div>
              <p className={styles.sectionLabelLight}>Thought Leadership</p>
              <h2 className={styles.tweetsHeadline}>
                Our <em>wisdom,</em><br />140 chars at a time.
              </h2>
            </div>
            <div className={styles.socialLinks}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className={styles.socialLink}>𝕏</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className={styles.socialLink}>in</a>
            </div>
          </div>
          <div className={styles.tweetsGrid}>
            {tweets.map((tweet) => (
              <div
                key={tweet.id}
                className={`${styles.tweetCard} ${tweet.featured ? styles.tweetFeatured : ""}`}
              >
                <div className={styles.tweetHeader}>
                  <div className={styles.tweetAvatar}>M</div>
                  <div className={styles.tweetMeta}>
                    <div className={styles.tweetName}>Monochromacy</div>
                    <div className={styles.tweetHandle}>@monochromacy.co</div>
                  </div>
                  <span className={styles.tweetPlatform}>𝕏</span>
                </div>
                <p className={styles.tweetBody}>
                  {tweet.body.split("\n").map((line, i) => (
                    <span key={i}>{line}{i < tweet.body.split("\n").length - 1 && <br />}</span>
                  ))}
                </p>
                {tweet.tags && <p className={styles.tweetTags}>{tweet.tags}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div>
              <span className={styles.footerLogo}>
                Mono<span>chromacy</span>
              </span>
              <p className={styles.footerTagline}>
                We&apos;re a company. We do things. Some of those things are documented here.
                Others are classified. Others are simply too innovative to explain.
                That&apos;s the Monochromacy way.
              </p>
            </div>
            <div>
              <p className={styles.footerColTitle}>Navigate</p>
              <ul className={styles.footerLinks}>
                {["Mission|/#about", "Social|/#tweets", "Innovations|/innovations",
                  "NPCDetect™|/npcdetect", "Shop|/shop"].map((item) => {
                  const [label, href] = item.split("|");
                  return <li key={href}><a href={href}>{label}</a></li>;
                })}
              </ul>
            </div>
            <div>
              <p className={styles.footerColTitle}>Find Us</p>
              <ul className={styles.footerLinks}>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter / X</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href="#">Somewhere in the submarine</a></li>
                <li><a href="#">The casino office (no exit)</a></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>© 2020–2026 Monochromacy. All rights reserved. Data already leaked.</p>
            <div className={styles.footerSocial}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
