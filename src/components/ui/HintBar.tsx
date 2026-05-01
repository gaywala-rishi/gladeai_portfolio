"use client";

import { useState, useEffect } from "react";
import { useSceneStore } from "@/store/sceneStore";
import styles from "./HintBar.module.css";

export default function HintBar() {
  const loading = useSceneStore((s) => s.loading);
  const focusKey = useSceneStore((s) => s.focus.key);
  const [dismissed, setDismissed] = useState(false);
  const [hintText, setHintText] = useState("");

  useEffect(() => {
    const isTouch = "ontouchstart" in window;
    setHintText(
      isTouch
        ? "Tap an object · Drag to orbit · Pinch to zoom"
        : "Click an object to explore · Drag to orbit · Scroll to zoom",
    );
  }, []);

  useEffect(() => {
    if (focusKey) setDismissed(true);
  }, [focusKey]);

  if (!loading.done || dismissed || !hintText) return null;

  return (
    <p className={styles.hint} aria-hidden="true">
      {hintText}
    </p>
  );
}
