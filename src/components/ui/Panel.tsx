"use client";

import { useEffect } from "react";
import { useUIStore, closePanel } from "@/store/uiStore";
import { setFocus } from "@/store/sceneStore";
import styles from "./Panel.module.css";

function handleClose() {
  setFocus(null);
  closePanel();
}

export default function Panel() {
  const panel = useUIStore((s) => s.panel);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  return (
    <>
      <div
        className={`${styles.panel}${panel.open ? " " + styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={panel.content?.title ?? "Detail panel"}
        aria-hidden={!panel.open}
      >
        <button
          className={styles.panelClose}
          onClick={handleClose}
          aria-label="Close panel"
        >
          ✕
        </button>
        {panel.content && (
          <>
            <h2 className={styles.panelTitle}>{panel.content.title}</h2>
            <div
              className={styles.panelBody}
              dangerouslySetInnerHTML={{ __html: panel.content.html }}
            />
          </>
        )}
      </div>

      {panel.open && (
        <button
          className={styles.panelBackdrop}
          onClick={handleClose}
          aria-label="Close panel"
          tabIndex={-1}
        />
      )}
    </>
  );
}
