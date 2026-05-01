"use client";

import { useEffect } from "react";
import { useUIStore, toggleHelp, closeHelp } from "@/store/uiStore";
import styles from "./HelpModal.module.css";

const CONTROLS = [
  ["🖱️", "Drag", "Orbit / rotate the room"],
  ["⚙️", "Scroll", "Zoom in & out"],
  ["👆", "Click object", "Fly to it and open detail panel"],
  ["⎋", "Esc", "Close panel and reset view"],
] as const;

const OBJECTS = [
  ["💻", "Laptop", "Projects & work"],
  ["📚", "Bookshelf", "Skills & technologies"],
  ["🖼️", "Wall Frame", "About me"],
  ["👨‍💻", "Developer", "Contact info"],
  ["💡", "Desk Lamp", "Click to toggle the lamp on / off"],
] as const;

export default function HelpModal() {
  const help = useUIStore((s) => s.help);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") closeHelp();
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  return (
    <>
      <button
        className={`${styles.helpBtn}${help.open ? " " + styles.active : ""}`}
        onClick={toggleHelp}
        aria-label="Controls & instructions"
        aria-expanded={help.open}
      >
        ?
      </button>

      {help.open && (
        <>
          <div
            className={styles.helpModal}
            role="dialog"
            aria-modal="true"
            aria-label="Controls & Instructions"
          >
            <div className={styles.helpTitle}>Controls &amp; Guide</div>

            <section className={styles.helpSection}>
              <div className={styles.helpSectionLabel}>Navigate</div>
              {CONTROLS.map(([icon, key, val]) => (
                <div key={key} className={styles.helpRow}>
                  <span className={styles.helpIcon} aria-hidden="true">
                    {icon}
                  </span>
                  <span className={styles.helpRowText}>
                    <span className={styles.helpKey}>{key}</span>
                    <span className={styles.helpVal}>{val}</span>
                  </span>
                </div>
              ))}
            </section>

            <hr className={styles.helpDivider} />

            <section className={styles.helpSection}>
              <div className={styles.helpSectionLabel}>Interactive Objects</div>
              {OBJECTS.map(([icon, key, val]) => (
                <div key={key} className={styles.helpRow}>
                  <span className={styles.helpIcon} aria-hidden="true">
                    {icon}
                  </span>
                  <span className={styles.helpRowText}>
                    <span className={styles.helpKey}>{key}</span>
                    <span className={styles.helpVal}>{val}</span>
                  </span>
                </div>
              ))}
            </section>

            <hr className={styles.helpDivider} />

            <p className={styles.helpTip}>
              Room lighting changes with the real time of day. The developer
              goes to bed at 11&nbsp;PM and returns to the desk
              at&nbsp;7&nbsp;AM.
            </p>

            <button
              className={styles.helpClose}
              onClick={closeHelp}
              aria-label="Close help"
            >
              ✕
            </button>
          </div>

          <button
            className={styles.modalBackdrop}
            onClick={closeHelp}
            aria-label="Close help"
            tabIndex={-1}
          />
        </>
      )}
    </>
  );
}
