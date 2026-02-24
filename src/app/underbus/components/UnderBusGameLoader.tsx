"use client";

import dynamic from "next/dynamic";
import styles from "../underbus.module.css";

const UnderBusGame = dynamic(() => import("./UnderBusGame"), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingPlaceholder}>
      <span>LOADING SIMULATION...</span>
    </div>
  ),
});

export default function UnderBusGameLoader() {
  return <UnderBusGame />;
}
