"use client";

import React from "react";

import { software } from "../../content";
import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./SoftwareShowcase.module.css";

export function SoftwareShowcase() {
  const { t } = useTranslation();

  return (
    <section id="software" className={styles.section} aria-label={t.software.title}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <span>{t.software.tag}</span>
          </div>
          <h2 className={styles.sectionTitle}>
            {t.software.title} <br />
            <span className={styles.sectionTitleAccent}>{t.software.titleAccent}</span>
          </h2>
          <p className={styles.sectionLead}>{t.software.lead}</p>
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
                  <span>{t.software.repoLink}</span>
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
