import React from "react";

import { software } from "../../content";
import styles from "./SoftwareShowcase.module.css";

export function SoftwareShowcase() {
  return (
    <section id="software" className={styles.section} aria-label="Computational Software & Solvers">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <span>02 / Computational Software & Solvers</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Open-Source Tools <br />
            <span className={styles.sectionTitleAccent}>for Nanomagnetic Simulation</span>
          </h2>
          <p className={styles.sectionLead}>
            Specialized packages designed to calculate spin-wave trajectories, ray optics, and real-time
            topological soliton numbers from continuum micromagnetic datasets.
          </p>
        </div>

        <div className={styles.softwareGrid}>
          {software.map((tool) => (
            <article key={tool.id} className={styles.softwareCard} data-testid={`software-card-${tool.id}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.toolName}>{tool.name}</h3>
                  <p className={styles.toolTagline}>{tool.tagline}</p>
                </div>
                <div className={styles.badgeStack}>
                  <span className={styles.licenseBadge}>{tool.license}</span>
                </div>
              </div>

              <p className={styles.toolDescription}>{tool.description}</p>

              <ul className={styles.highlightsList}>
                {tool.highlights.map((highlight) => (
                  <li key={highlight} className={styles.highlightItem}>
                    <span className={styles.bullet} aria-hidden="true">
                      &rarr;
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.techRow}>
                {tool.technologies.map((tech) => (
                  <span key={tech} className={styles.techPill}>
                    {tech}
                  </span>
                ))}
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.roleLabel}>{tool.role}</span>
                <a
                  href={tool.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.repoLink}
                  aria-label={`View ${tool.name} source code on GitHub`}
                >
                  <span>GitHub Repository</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
