import type { Metadata } from "next";
import { resume } from "@/lib/data/resume";
import ScrollablePage from "@/components/ui/ScrollablePage";
import styles from "../subpage.module.css";

export const metadata: Metadata = {
  title: `About ${resume.about.name} — ${resume.about.role}`,
  description: `${resume.about.bio} ${resume.about.facts.join(". ")}.`,
  alternates: { canonical: "https://alexmorgan.dev/about" },
};

export default function AboutPage() {
  return (
    <ScrollablePage>
      <div className={styles.page}>
        <a href="/" className={styles.backLink}>
          ← Back to 3D Portfolio
        </a>

        <header>
          <h1>{resume.about.name}</h1>
          <p className={styles.role}>{resume.about.role}</p>
          {resume.contact.available && (
            <span className={styles.badge}>Open to opportunities</span>
          )}
        </header>

        <section aria-labelledby="bio-heading">
          <h2 id="bio-heading">Biography</h2>
          <p>{resume.about.bio}</p>
        </section>

        <section aria-labelledby="facts-heading">
          <h2 id="facts-heading">Quick Facts</h2>
          <ul>
            {resume.about.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="links-heading">
          <h2 id="links-heading">Links</h2>
          <div className={styles.links}>
            {resume.about.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                className={`${styles.linkBtn} ${link.type === "primary" ? styles.linkBtnPrimary : styles.linkBtnSecondary}`}
                rel="noopener"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </ScrollablePage>
  );
}
