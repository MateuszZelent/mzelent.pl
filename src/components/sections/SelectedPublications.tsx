import React from "react";

import { publications } from "../../content";
import styles from "./SelectedPublications.module.css";

export function SelectedPublications() {
  return (
    <section id="publications" className={styles.section} aria-label="Selected Publications">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <span>03 / Selected Publications</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Peer-Reviewed Articles <br />
            <span className={styles.sectionTitleAccent}>& Physical Review Studies</span>
          </h2>
          <p className={styles.sectionLead}>
            Key papers advancing curvilinear magnetism, graded refractive magnonic lenses, and chiral skyrmion
            motion in leading physics journals.
          </p>
        </div>

        <div className={styles.publicationList}>
          {publications.map((pub) => (
            <article
              key={pub.id}
              className={styles.publicationCard}
              data-testid={`publication-card-${pub.id}`}
            >
              <div className={styles.metaRow}>
                <span className={styles.journalPill}>{pub.journal}</span>
                <span className={styles.yearPill}>{pub.year}</span>
                {pub.openAccess && <span className={styles.openAccessBadge}>Open Access</span>}
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
      </div>
    </section>
  );
}
