"use client";

import { useSceneStore } from "@/store/sceneStore";
import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  const loading = useSceneStore((s) => s.loading);

  if (loading.done) return null;

  return (
    <div
      className={styles.loadingScreen}
      role="status"
      aria-live="polite"
      aria-label="Loading 3D scene"
    >
      <div className={styles.loaderTitle}>Portfolio Room</div>
      <div className={styles.loaderBarWrap}>
        <div
          className={styles.loaderBar}
          style={{ width: `${loading.progress}%` }}
        />
      </div>
      <div className={styles.loaderHint}>{loading.hint}</div>
    </div>
  );
}
