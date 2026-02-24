import Nav from "@/components/Nav";
import styles from "./underbus.module.css";
import UnderBusGameLoader from "./components/UnderBusGameLoader";

export default function UnderBusPage() {
  return (
    <>
      <Nav />
      <div className={styles.pageWrapper}>
        <UnderBusGameLoader />
      </div>
    </>
  );
}
