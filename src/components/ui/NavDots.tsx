"use client";

import { useSceneStore, setFocus } from "@/store/sceneStore";
import type { SceneObjectKey } from "@/store/sceneStore";
import styles from "./NavDots.module.css";

const DOTS: { key: SceneObjectKey; label: string }[] = [
  { key: "macbook", label: "Projects" },
  { key: "bookshelf", label: "Skills" },
  { key: "imac", label: "About Me" },
  { key: "character", label: "Contact" },
];

export default function NavDots() {
  const loading = useSceneStore((s) => s.loading);
  const focusKey = useSceneStore((s) => s.focus.key);

  if (!loading.done) return null;

  return (
    <nav className={styles.navDots} aria-label="Quick navigation">
      {DOTS.map(({ key, label }) => (
        <button
          key={key}
          className={`${styles.navDot}${focusKey === key ? " " + styles.active : ""}`}
          onClick={() => setFocus(key)}
          aria-label={label}
          title={label}
        >
          <span className={styles.navDotLabel}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
