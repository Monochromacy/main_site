"use client";

import dynamic from "next/dynamic";
import styles from "../deepdive.module.css";

const DeepDiveGame = dynamic(() => import("./DeepDiveGame"), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingPlaceholder}>
      <span>INITIALIZING SUBMARINE...</span>
    </div>
  ),
});

export default function DeepDiveGameLoader() {
  return <DeepDiveGame />;
}
