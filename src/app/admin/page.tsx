import Nav from "@/components/Nav";
import styles from "./admin.module.css";

type StatusType = "online" | "offline" | "degraded";

const services: { name: string; status: StatusType }[] = [
  { name: "Career Page", status: "offline" },
  { name: "Onboarding", status: "offline" },
  { name: "User Login", status: "offline" },
  { name: "IntraNet", status: "offline" },
  { name: "NPC Detect", status: "online" },
  { name: "Email", status: "degraded" },
  { name: "Instant Messaging", status: "offline" },
  { name: "Deep Dive", status: "online" },
  { name: "Under The Bus", status: "online" },
];

const statusLabel: Record<StatusType, string> = {
  online: "Online",
  offline: "Offline",
  degraded: "Degraded Service",
};

export default function AdminStatus() {
  return (
    <>
      <Nav />
      <main className={styles.container}>
        <div className={styles.inner}>
          <p className={styles.label}>&gt; SYSTEM_STATUS</p>
          <h1 className={styles.heading}>Status</h1>
          <table className={styles.table}>
            <tbody>
              {services.map(({ name, status }) => (
                <tr key={name} className={styles.row}>
                  <td className={styles.service}>{name}</td>
                  <td className={styles.statusCell}>
                    <span className={`${styles.badge} ${styles[status]}`}>
                      <span className={styles.dot} />
                      {statusLabel[status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
