"use client";

import { useState, useEffect } from "react";
import { useUIStore, dismissMobileNotice } from "@/store/uiStore";
import styles from "./MobileNotice.module.css";

export default function MobileNotice() {
  const dismissed = useUIStore((s) => s.mobile.dismissed);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    setShouldShow(window.innerWidth < 768);
  }, []);

  if (!shouldShow || dismissed) return null;

  return (
    <div
      className={styles.mobileNotice}
      role="alertdialog"
      aria-modal="true"
      aria-label="Screen size notice"
    >
      <h2>Best on desktop</h2>
      <p>
        This 3D experience is optimised for a larger screen.
        <br />
        You can still continue on mobile.
      </p>
      <button className={styles.continueBtn} onClick={dismissMobileNotice}>
        Continue anyway
      </button>
    </div>
  );
}
