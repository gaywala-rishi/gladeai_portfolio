// Scene store — reactive state shared between Scene.tsx and UI components.
// Replaces scene.svelte.ts ($state runes) with Zustand.

import { create } from "zustand";

export type SceneObjectKey =
  | "macbook"
  | "bookshelf"
  | "imac"
  | "character"
  | "lamp"
  | null;

export type LoadStage =
  | "idle"
  | "renderer"
  | "lights"
  | "room"
  | "furniture"
  | "character"
  | "ready";

interface SceneStore {
  loading: {
    progress: number;
    hint: string;
    stage: LoadStage;
    done: boolean;
  };
  focus: { key: SceneObjectKey };
  lamp: { on: boolean };
  clock: { hour: number; minute: number; dayT: number };
  webgl: { supported: boolean; checked: boolean };

  setProgress: (pct: number, hint: string, stage?: LoadStage) => void;
  setFocus: (key: SceneObjectKey) => void;
  toggleLamp: () => void;
  updateClock: (hour: number, minute: number, dayT: number) => void;
  setWebGLSupport: (supported: boolean) => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
  loading: {
    progress: 0,
    hint: "Initialising scene…",
    stage: "idle",
    done: false,
  },
  focus: { key: null },
  lamp: { on: true },
  clock: {
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    dayT: 0,
  },
  webgl: { supported: true, checked: false },

  setProgress: (pct, hint, stage) =>
    set((s) => ({
      loading: {
        ...s.loading,
        progress: pct,
        hint,
        ...(stage && { stage }),
        done: pct >= 100,
      },
    })),

  setFocus: (key) => set((s) => ({ focus: { ...s.focus, key } })),

  toggleLamp: () => set((s) => ({ lamp: { on: !s.lamp.on } })),

  updateClock: (hour, minute, dayT) => set({ clock: { hour, minute, dayT } }),

  setWebGLSupport: (supported) => set({ webgl: { supported, checked: true } }),
}));

// Convenience function exports (mirrors old API)
export const setProgress = (pct: number, hint: string, stage?: LoadStage) =>
  useSceneStore.getState().setProgress(pct, hint, stage);
export const setFocus = (key: SceneObjectKey) =>
  useSceneStore.getState().setFocus(key);
export const toggleLamp = () => useSceneStore.getState().toggleLamp();
export const updateClock = (hour: number, minute: number, dayT: number) =>
  useSceneStore.getState().updateClock(hour, minute, dayT);
export const setWebGLSupport = (supported: boolean) =>
  useSceneStore.getState().setWebGLSupport(supported);
