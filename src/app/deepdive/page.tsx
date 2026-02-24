import Nav from "@/components/Nav";
import styles from "./deepdive.module.css";
import DeepDiveGameLoader from "./components/DeepDiveGameLoader";

export default function DeepDivePage() {
  return (
    <>
      <Nav />
      <div className={styles.pageWrapper}>
        <DeepDiveGameLoader />
      </div>
    </>
  );
}
