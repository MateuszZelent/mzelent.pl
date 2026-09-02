"use client";

import Link from "next/link";
import React, { useRef } from "react";

import { researchDomains } from "../../content";
import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./ResearchGrid.module.css";

export function ResearchGrid() {
  const containerRef = useRef<HTMLElement>(null);
  const { t, language } = useTranslation();

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section id="research" ref={containerRef} className={styles.section} aria-label="Research Domains">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <span>{t.researchGrid.tag}</span>
          </div>
          <h2 className={styles.sectionTitle}>
            {t.researchGrid.title} <br />
            <span className={styles.sectionTitleAccent}>{t.researchGrid.titleAccent}</span>
          </h2>
          <p className={styles.sectionLead}>{t.researchGrid.lead}</p>
        </div>

        <div className={styles.grid}>
          {researchDomains.map((domain) => (
            <div
              key={domain.id}
              id={domain.id}
              className={styles.card}
              onPointerMove={handlePointerMove}
              data-testid={`research-card-${domain.id}`}
            >
              <div className={styles.cardGlow} aria-hidden="true" />
              <div className={styles.cardBorder} aria-hidden="true" />
              <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                  <span className={styles.cardNumber}>{domain.index}</span>
                  <div className={styles.cardIndicator} aria-hidden="true" />
                </div>

                <h3 className={styles.cardTitle}>{domain.title}</h3>
                <p className={styles.cardDescription}>{domain.description}</p>

                {domain.equationsOrNotation && domain.equationsOrNotation.length > 0 && (
                  <div className={styles.equationRow}>
                    {domain.equationsOrNotation.map((eq) => (
                      <code key={eq} className={styles.equationBadge}>
                        {eq}
                      </code>
                    ))}
                  </div>
                )}

                <div className={styles.cardTags}>
                  {domain.keyConcepts.map((concept) => (
                    <span key={concept} className={styles.tag}>
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.detailAction}>
          <Link href="/research" className={styles.detailLink}>
            {language === "pl"
              ? "Zobacz szczegółowy opis osi badawczych i formalizm teoretyczny →"
              : "Explore detailed research axes and theoretical formalism →"}
          </Link>
        </div>
      </div>
    </section>
  );
}
