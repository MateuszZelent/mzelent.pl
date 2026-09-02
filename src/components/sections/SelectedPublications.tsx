"use client";

import Link from "next/link";
import React from "react";

import { publications } from "../../content";
import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./SelectedPublications.module.css";

export function SelectedPublications() {
  const { t } = useTranslation();

  return (
    <section id="publications" className={styles.section} aria-label={t.publications.title}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <span>{t.publications.tag}</span>
          </div>
          <h2 className={styles.sectionTitle}>
            {t.publications.title} <br />
            <span className={styles.sectionTitleAccent}>{t.publications.titleAccent}</span>
          </h2>
          <p className={styles.sectionLead}>{t.publications.lead}</p>
        </div>

        <div className={styles.publicationList}>
          {publications.slice(0, 4).map((pub) => (
            <article
              key={pub.id}
              className={styles.publicationCard}
              data-testid={`publication-card-${pub.id}`}
            >
              <div className={styles.metaRow}>
                <span className={styles.journalPill}>{pub.journal}</span>
                <span className={styles.yearPill}>{pub.year}</span>
                {typeof pub.citations === "number" && pub.citations > 0 && (
                  <span className={styles.citationsBadge}>
                    ★ {pub.citations} {t.publications.citations}
                  </span>
                )}
                {pub.openAccess && (
                  <span className={styles.openAccessBadge}>{t.publications.openAccess}</span>
                )}
              </div>

              <h3 className={styles.paperTitle}>{pub.title}</h3>
              <p className={styles.paperAuthors}>{pub.authors.join(", ")}</p>
              <p className={styles.paperAbstract}>{pub.abstract}</p>

              <div className={styles.cardFooter}>
                <a
                  href={pub.doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.doiLink}
                  aria-label={`Open DOI link for paper: ${pub.title}`}
                >
                  <span>DOI: {pub.doi}</span>
                  <span aria-hidden="true">↗</span>
                </a>

                <div className={styles.keywords}>
                  {pub.keywords.slice(0, 3).map((kw) => (
                    <span key={kw} className={styles.keyword}>
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.viewAllWrapper}>
          <Link href="/publications" className={styles.viewAllLink} data-testid="view-all-publications-btn">
            <span>{t.publications.viewAll}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
