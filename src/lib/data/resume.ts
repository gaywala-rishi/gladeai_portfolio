// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResumeLink {
  label: string;
  url: string;
  type: "primary" | "secondary";
}

export interface ResumeAbout {
  name: string;
  role: string;
  bio: string;
  facts: string[];
  links: ResumeLink[];
}

export interface ResumeProject {
  name: string;
  desc: string;
  tech: string[];
  url?: string;
}

export interface ResumeSkills {
  frontend: string[];
  backend: string[];
  tools: string[];
}

export interface ResumeContact {
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  location: string;
  available: boolean;
}

export interface ResumeData {
  about: ResumeAbout;
  projects: ResumeProject[];
  skills: ResumeSkills;
  contact: ResumeContact;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// Edit this file to update your portfolio content.
// The 3D scene reads from this same source, so changes here update both the
// interactive room labels AND the SEO-friendly HTML fallback pages.

export const resume: ResumeData = {
  about: {
    name: "Rishi Gaiwala",
    role: "Full-Stack & AI/ML Developer",
    bio: "I build fast, accessible, and visually rich web applications. Passionate about bridging design and engineering — from pixel-perfect interfaces to robust backend systems.",
    facts: [
      "4+ years experience",
      "10+ shipped products",
      "Open-source contributor",
      "Coffee-driven",
    ],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/gaywala-rishi",
        type: "primary",
      },
      { label: "Portfolio", url: "/", type: "secondary" },
      { label: "Resume PDF", url: "#", type: "secondary" },
    ],
  },

  projects: [
    {
      name: "NovaDash",
      desc: "Real-time analytics dashboard with WebSocket streaming, D3 charts, and drag-and-drop layout builder.",
      tech: ["React", "Node.js", "WebSocket", "D3"],
    },
    {
      name: "ArcAPI",
      desc: "Type-safe REST & GraphQL gateway with auto-generated docs, rate-limiting, and OAuth2.",
      tech: ["TypeScript", "GraphQL", "PostgreSQL", "Redis"],
    },
    {
      name: "ShiftCMS",
      desc: "Headless CMS with live preview, multi-locale support, and a visual block editor.",
      tech: ["Next.js", "Prisma", "tRPC", "S3"],
    },
    {
      name: "LumaUI",
      desc: "Accessible component library (WCAG 2.1 AA) with zero-runtime CSS and Storybook docs.",
      tech: ["React", "Radix UI", "Vanilla Extract"],
    },
  ],

  skills: {
    frontend: [
      "React / Next.js",
      "TypeScript",
      "Three.js / WebGL",
      "Tailwind CSS",
      "Framer Motion",
      "Vite",
    ],
    backend: [
      "Node.js / Bun",
      "PostgreSQL",
      "Redis",
      "GraphQL",
      "Prisma",
      "Docker",
    ],
    tools: [
      "Git / GitHub",
      "Figma",
      "Vercel / AWS",
      "Playwright",
      "Storybook",
      "CI/CD",
    ],
  },

  contact: {
    email: "rishigaiwala@gmail.com",
    github: "github.com/rishi-gaywala",
    linkedin: "linkedin.com/in/rishigaiwala",
    twitter: "@rishigaiwala",
    location: "Surat,Gujarat,India",
    available: true,
  },
};
