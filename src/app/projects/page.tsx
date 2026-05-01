import type { Metadata } from "next";
import { resume } from "@/lib/data/resume";
import ScrollablePage from "@/components/ui/ScrollablePage";
import styles from "../subpage.module.css";

export const metadata: Metadata = {
  title: `Projects — ${resume.about.name}`,
  description: `Portfolio projects by ${resume.about.name}: ${resume.projects.map((p) => p.name).join(", ")}. ${resume.about.role} specialising in ${resume.skills.frontend.slice(0, 3).join(", ")}.`,
  alternates: { canonical: "https://alexmorgan.dev/projects" },
};

export default function ProjectsPage() {
  return (
    <ScrollablePage>
      <div className={styles.page}>
        <a href="/" className={styles.backLink}>
          ← Back to 3D Portfolio
        </a>

        <header>
          <h1>Projects</h1>
          <p className={styles.role}>
            {resume.about.name} · {resume.about.role}
          </p>
        </header>

        <section aria-label="Project portfolio">
          <div className={styles.projectGrid}>
            {resume.projects.map((project) => (
              <article key={project.name} className={styles.projectCard}>
                <h2>{project.name}</h2>
                <p>{project.desc}</p>
                <ul className={styles.techList} aria-label="Technologies">
                  {project.tech.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
                {project.url && (
                  <a
                    href={project.url}
                    className={styles.projectLink}
                    rel="noopener"
                  >
                    View project →
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </ScrollablePage>
  );
}
