"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";

import { Footer } from "../../components/footer/Footer";
import { Header } from "../../components/navigation/Header";
import { talksData } from "../../content/data/talks";
import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./talks.module.css";

export default function TalksPage() {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<"all" | "Invited">("all");

  const filteredTalks = useMemo(() => {
    if (filterType === "Invited") {
      return talksData.filter((talk) => talk.type === "Invited");
    }
    return talksData;
  }, [filterType]);

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <Link href="/" className={styles.backLink}>
          {t.researchPage.backToHome}
        </Link>

        <header className={styles.headerArea}>
          <span className={styles.badge}>{t.talksPage.badge}</span>
          <h1 className={styles.title}>
            {t.talksPage.heading} <br />
            <span className={styles.titleAccent}>{t.talksPage.headingAccent}</span>
          </h1>
          <p className={styles.lead}>{t.talksPage.lead}</p>
        </header>

        <div className={styles.filterBar} role="group" aria-label="Filter talks by type">
          <button
            type="button"
            className={`${styles.filterBtn} ${filterType === "all" ? styles.filterBtnActive : ""}`}
            onClick={() => setFilterType("all")}
          >
            {t.talksPage.filterAll} ({talksData.length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filterType === "Invited" ? styles.filterBtnActive : ""}`}
            onClick={() => setFilterType("Invited")}
          >
            {t.talksPage.filterInvited} ({talksData.filter((tk) => tk.type === "Invited").length})
          </button>
        </div>

        <div className={styles.talksList}>
          {filteredTalks.map((talk) => (
            <article key={talk.id} className={styles.talkCard} aria-labelledby={`talk-${talk.id}`}>
              <div className={styles.cardHead}>
                <div className={styles.tagGroup}>
                  <span
                    className={`${styles.typeBadge} ${
                      talk.type === "Invited" ? styles.invitedBadge : styles.contributedBadge
                    }`}
                  >
                    {talk.type}
                  </span>
                  <span className={styles.talkDate}>{talk.date}</span>
                </div>
              </div>

              <h2 id={`talk-${talk.id}`} className={styles.talkTitle}>
                {talk.title}
              </h2>

              <div className={styles.talkMeta}>
                <span>{talk.event}</span>
                <span>•</span>
                <span>{talk.location}</span>
              </div>

              {talk.abstract && (
                <p className={styles.talkAbstract}>
                  <strong>{t.talksPage.abstractTitle}:</strong> {talk.abstract}
                </p>
              )}
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
