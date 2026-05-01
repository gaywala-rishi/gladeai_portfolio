// UI store — panel content, help modal, mobile notice state.
// Replaces ui.svelte.ts ($state runes) with Zustand.

import { create } from "zustand";
import type { SceneObjectKey } from "./sceneStore";
import { resume } from "@/lib/data/resume";

export type PanelContent = {
  title: string;
  html: string;
} | null;

interface UIStore {
  panel: { open: boolean; content: PanelContent };
  help: { open: boolean };
  mobile: { dismissed: boolean };

  openPanel: (key: SceneObjectKey) => void;
  closePanel: () => void;
  toggleHelp: () => void;
  closeHelp: () => void;
  dismissMobileNotice: () => void;
}

function buildPanelContent(key: SceneObjectKey): PanelContent {
  if (!key) return null;

  switch (key) {
    case "macbook": {
      const projectCards = resume.projects
        .map(
          (p) => `
					<div class="panel-card">
						<h3>${p.name}</h3>
						<p>${p.desc}</p>
						<div class="tech-tags">${p.tech.map((t) => `<span>${t}</span>`).join("")}</div>
					</div>`,
        )
        .join("");
      return {
        title: "Projects",
        html: `<div class="panel-cards">${projectCards}</div>`,
      };
    }

    case "bookshelf": {
      const { frontend, backend, tools } = resume.skills;
      const section = (label: string, items: string[]) => `
				<div class="skill-group">
					<h3>${label}</h3>
					<ul>${items.map((s) => `<li>${s}</li>`).join("")}</ul>
				</div>`;
      return {
        title: "Skills",
        html:
          section("Frontend", frontend) +
          section("Backend", backend) +
          section("Tools", tools),
      };
    }

    case "imac": {
      const { name, role, bio, facts } = resume.about;
      return {
        title: "About Me",
        html: `
					<div class="about-panel">
						<h2>${name}</h2>
						<p class="role">${role}</p>
						<p>${bio}</p>
						<ul class="facts">${facts.map((f) => `<li>${f}</li>`).join("")}</ul>
					</div>`,
      };
    }

    case "character": {
      const { email, github, linkedin, twitter, location, available } =
        resume.contact;
      return {
        title: "Contact",
        html: `
					<div class="contact-panel">
						${available ? '<p class="available-badge">Open to opportunities</p>' : ""}
						<ul>
							<li><strong>Email</strong> <a href="mailto:${email}">${email}</a></li>
							<li><strong>GitHub</strong> <a href="https://${github}" target="_blank" rel="noopener">${github}</a></li>
							<li><strong>LinkedIn</strong> <a href="https://${linkedin}" target="_blank" rel="noopener">${linkedin}</a></li>
							<li><strong>Twitter</strong> ${twitter}</li>
							<li><strong>Location</strong> ${location}</li>
						</ul>
					</div>`,
      };
    }

    default:
      return null;
  }
}

export const useUIStore = create<UIStore>((set) => ({
  panel: { open: false, content: null },
  help: { open: false },
  mobile: { dismissed: false },

  openPanel: (key) =>
    set((s) => ({
      panel: {
        ...s.panel,
        open: !!buildPanelContent(key),
        content: buildPanelContent(key),
      },
    })),

  closePanel: () => {
    set((s) => ({ panel: { ...s.panel, open: false } }));
    setTimeout(
      () => set((s) => ({ panel: { ...s.panel, content: null } })),
      300,
    );
  },

  toggleHelp: () => set((s) => ({ help: { open: !s.help.open } })),

  closeHelp: () => set({ help: { open: false } }),

  dismissMobileNotice: () => set({ mobile: { dismissed: true } }),
}));

// Convenience function exports
export const openPanel = (key: SceneObjectKey) =>
  useUIStore.getState().openPanel(key);
export const closePanel = () => useUIStore.getState().closePanel();
export const toggleHelp = () => useUIStore.getState().toggleHelp();
export const closeHelp = () => useUIStore.getState().closeHelp();
export const dismissMobileNotice = () =>
  useUIStore.getState().dismissMobileNotice();
