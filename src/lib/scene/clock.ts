// clock.ts — Simulated time system.
// Drives dayT (0=night, 1=day) and exposes window.simTime / window.setSimHour
// for development testing, exactly as the original did.

import { updateClock } from "@/store/sceneStore";

export interface SimClock {
  hour: number;
  minute: number;
  dayT: number;
}

let _overrideHour: number | null = null;
let _overrideMinute: number | null = null;

/** Compute dayT (0–1) from a given hour/minute. Matches original curve. */
function computeDayT(hour: number, minute: number): number {
  const totalH = hour + minute / 60;
  // Dawn 6–8, dusk 18–20
  if (totalH < 6) return 0;
  if (totalH < 8) return (totalH - 6) / 2;
  if (totalH < 18) return 1;
  if (totalH < 20) return 1 - (totalH - 18) / 2;
  return 0;
}

export function tickClock(): SimClock {
  const now = new Date();
  const hour = _overrideHour ?? now.getHours();
  const minute = _overrideMinute ?? now.getMinutes();
  const dayT = computeDayT(hour, minute);
  // Push into reactive store so UI components (clock widget) update automatically
  updateClock(hour, minute, dayT);
  return { hour, minute, dayT };
}

/** Expose testing helpers on window (dev only). */
export function exposeDevHelpers() {
  if (typeof window === "undefined") return;
  (window as any).setSimHour = (h: number, m = 0) => {
    _overrideHour = h;
    _overrideMinute = m;
  };
  (window as any).simTime = () => {
    const now = new Date();
    return {
      hour: _overrideHour ?? now.getHours(),
      minute: _overrideMinute ?? now.getMinutes(),
    };
  };
}
