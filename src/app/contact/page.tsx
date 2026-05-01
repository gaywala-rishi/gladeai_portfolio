import type { Metadata } from "next";
import { resume } from "@/lib/data/resume";
import ScrollablePage from "@/components/ui/ScrollablePage";
import styles from "../subpage.module.css";

export const metadata: Metadata = {
  title: `Contact ${resume.about.name} — ${resume.about.role}`,
  description: `Get in touch with ${resume.about.name}, a ${resume.about.role} based in ${resume.contact.location}.${resume.contact.available ? " Currently open to new opportunities." : ""}`,
  alternates: { canonical: "https://alexmorgan.dev/contact" },
};

export default function ContactPage() {
  return (
    <ScrollablePage>
      <div className={styles.page}>
        <a href="/" className={styles.backLink}>
          ← Back to 3D Portfolio
        </a>

        <header>
          <h1>Contact</h1>
          <p className={styles.role}>
            {resume.about.name} · {resume.contact.location}
          </p>
          {resume.contact.available && (
            <span className={styles.badge}>Open to opportunities</span>
          )}
        </header>

        <section aria-label="Contact information">
          <address>
            <dl className={styles.dlList}>
              <div className={styles.dlRow}>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${resume.contact.email}`}>
                    {resume.contact.email}
                  </a>
                </dd>
              </div>
              <div className={styles.dlRow}>
                <dt>GitHub</dt>
                <dd>
                  <a
                    href={`https://${resume.contact.github}`}
                    rel="noopener noreferrer"
                  >
                    {resume.contact.github}
                  </a>
                </dd>
              </div>
              <div className={styles.dlRow}>
                <dt>LinkedIn</dt>
                <dd>
                  <a
                    href={`https://${resume.contact.linkedin}`}
                    rel="noopener noreferrer"
                  >
                    {resume.contact.linkedin}
                  </a>
                </dd>
              </div>
              <div className={styles.dlRow}>
                <dt>Twitter</dt>
                <dd>{resume.contact.twitter}</dd>
              </div>
              <div className={styles.dlRow}>
                <dt>Location</dt>
                <dd>{resume.contact.location}</dd>
              </div>
            </dl>
          </address>
        </section>
      </div>
    </ScrollablePage>
  );
}
