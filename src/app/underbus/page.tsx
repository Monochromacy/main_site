import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import styles from "./underbus.module.css";

const UnderBusGame = dynamic(() => import("./components/UnderBusGame"), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingPlaceholder}>
      <span>LOADING SIMULATION...</span>
    </div>
  ),
});

export default function UnderBusPage() {
  return (
    <>
      <Nav />
      <div className={styles.pageWrapper}>
        <UnderBusGame />
      </div>
    </>
  );
}
