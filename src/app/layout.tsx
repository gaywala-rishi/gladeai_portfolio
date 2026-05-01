import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { resume } from "@/lib/data/resume";
import "./globals.css";

const SITE_URL = "https://alexmorgan.dev";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const viewport: Viewport = {
  themeColor: "#0d0d1a",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: `${resume.about.name} — ${resume.about.role} | Interactive 3D Portfolio`,
  description: `Portfolio of ${resume.about.name}, a ${resume.about.role} based in ${resume.contact.location}. ${resume.about.bio}`,
  keywords: [
    "frontend developer portfolio",
    resume.about.name,
    "Three.js developer",
    "Next.js developer",
    "WebGL portfolio",
    "interactive resume",
    "creative developer",
    ...resume.skills.frontend,
  ],
  authors: [{ name: resume.about.name }],
  robots: "index, follow",
  alternates: { canonical: SITE_URL },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "profile",
    url: SITE_URL,
    title: `${resume.about.name} — Interactive 3D Portfolio`,
    description: `${resume.about.bio} Based in ${resume.contact.location}.`,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `Preview of ${resume.about.name}'s interactive 3D portfolio room`,
      },
    ],
    siteName: `${resume.about.name} Portfolio`,
    locale: "en_US",
    firstName: resume.about.name.split(" ")[0],
    lastName: resume.about.name.split(" ")[1],
  },
  twitter: {
    card: "summary_large_image",
    site: resume.contact.twitter,
    creator: resume.contact.twitter,
    title: `${resume.about.name} — Interactive 3D Portfolio`,
    description: resume.about.bio,
    images: [OG_IMAGE],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: resume.about.name,
  jobTitle: resume.about.role,
  description: resume.about.bio,
  email: `mailto:${resume.contact.email}`,
  url: SITE_URL,
  sameAs: [
    `https://${resume.contact.github}`,
    `https://${resume.contact.linkedin}`,
  ],
  knowsAbout: [
    ...resume.skills.frontend,
    ...resume.skills.backend,
    ...resume.skills.tools,
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: resume.contact.location,
  },
};

const creativeWorkSchema = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: `${resume.about.name} — Interactive 3D Portfolio`,
  description: `An interactive 3D resume built with Three.js and Next.js, showcasing ${resume.about.role} skills.`,
  author: { "@type": "Person", name: resume.about.name },
  url: SITE_URL,
  keywords:
    "frontend developer portfolio, Three.js developer, Next.js portfolio, interactive resume, WebGL resume",
  inLanguage: "en",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="person-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Script
          id="creative-work-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(creativeWorkSchema),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
