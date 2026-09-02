"use client";

import React from "react";

import { grants } from "../../content";
import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./GrantsSection.module.css";

export function GrantsSection() {
  const { language, t } = useTranslation();

  return (
    <section id="grants" className={styles.section} aria-label={t.grants.title}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <span>{t.grants.tag}</span>
          </div>
          <h2 className={styles.sectionTitle}>
            {t.grants.title} <br />
            <span className={styles.sectionTitleAccent}>{t.grants.titleAccent}</span>
          </h2>
          <p className={styles.sectionLead}>{t.grants.lead}</p>
        </div>

        <div className={styles.grantsList}>
          {grants.map((grant) => {
            const title = language === "pl" && grant.titlePl ? grant.titlePl : grant.title;
            const funder = language === "pl" && grant.funderPl ? grant.funderPl : grant.funder;
            const program = language === "pl" && grant.programPl ? grant.programPl : grant.program;
            const role = language === "pl" && grant.rolePl ? grant.rolePl : grant.role;
            const description =
              language === "pl" && grant.descriptionPl ? grant.descriptionPl : grant.description;
            const institutions =
              language === "pl" && grant.institutionsPl ? grant.institutionsPl : grant.institutions;

            return (
              <article key={grant.id} className={styles.grantCard} data-testid={`grant-card-${grant.id}`}>
                <div className={styles.cardHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    {grant.acronym && <span className={styles.acronymPill}>{grant.acronym}</span>}
                    <span className={styles.funderPill}>
                      {funder} · {program}
                    </span>
                  </div>

                  <span
                    className={`${styles.statusPill} ${
                      grant.status === "Active" ? styles.statusActive : styles.statusCompleted
                    }`}
                  >
                    {grant.status === "Active" ? t.grants.statusActive : t.grants.statusCompleted}
                  </span>
                </div>

                <h3 className={styles.grantTitle}>{title}</h3>
                <p className={styles.grantDescription}>{description}</p>

                <div className={styles.institutionRow}>
                  {institutions.map((inst) => (
                    <span key={inst} className={styles.instBadge}>
                      <span
                        aria-hidden="true"
                        style={{ color: "var(--accent-warm)", marginRight: "0.35rem" }}
                      >
                        ◈
                      </span>
                      {inst}
                    </span>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.detailsGroup}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>{t.grants.grantNo}</span>
                      <span className={styles.detailValueMono}>{grant.grantNumber}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Rola / Role:</span>
                      <span className={styles.detailValue}>{role}</span>
                    </div>

                    {grant.budget && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>{t.grants.budget}</span>
                        <span className={styles.detailValueMono}>{grant.budget}</span>
                      </div>
                    )}

                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Lata / Years:</span>
                      <span className={styles.detailValue}>
                        {grant.startYear} – {grant.endYear}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
