"use client";

import Link from "next/link";
import React, { useState } from "react";

import { Footer } from "../../../components/footer/Footer";
import { Header } from "../../../components/navigation/Header";
import { useTranslation } from "../../../content/i18n/i18n-context";
import { type Publication, PublicationSchema } from "../../../content/schemas/publication.schema";
import styles from "./admin.module.css";

const INITIAL_SCHOLAR_SAMPLE = `@article{zelent2024neuromorphic,
  title = {Chiral Non-stationary Auto-oscillators for Neuromorphic Reservoir Computing},
  author = {Zelent, Mateusz and Pirro, Philipp},
  journal = {Physical Review Applied},
  year = {2024},
  doi = {10.1103/PhysRevApplied.22.044000},
  abstract = {Theoretical demonstration of non-stationary spin-torque auto-oscillations for bio-inspired neuromorphic computing under MSCA CNMA grant.}
}`;

export default function AdminScholarPage() {
  const { t } = useTranslation();
  const [bibtexInput, setBibtexInput] = useState(INITIAL_SCHOLAR_SAMPLE);
  const [stagedList, setStagedList] = useState<Publication[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const parseBibtexText = (text: string): Publication => {
    // Regex extractors for standard BibTeX tags
    const titleMatch = text.match(/title\s*=\s*[{"]([^}"]+)[}"]/i);
    const authorMatch = text.match(/author\s*=\s*[{"]([^}"]+)[}"]/i);
    const journalMatch = text.match(/journal\s*=\s*[{"]([^}"]+)[}"]/i);
    const yearMatch = text.match(/year\s*=\s*[{"]?(\d{4})[}"]?/i);
    const doiMatch = text.match(/doi\s*=\s*[{"]([^}"]+)[}"]/i);
    const abstractMatch = text.match(/abstract\s*=\s*[{"]([^}"]+)[}"]/i);
    const keyMatch = text.match(/@\w+\s*[{]\s*([^,]+),/);

    const id = keyMatch ? keyMatch[1].trim() : `pub-${Date.now()}`;
    const title = titleMatch ? titleMatch[1].trim() : "Untitled Research Paper";
    const authors = authorMatch ? authorMatch[1].split(/\s+and\s+/i).map((a) => a.trim()) : ["M. Zelent"];
    const journal = journalMatch ? journalMatch[1].trim() : "Physical Review B";
    const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
    const doi = doiMatch ? doiMatch[1].trim() : `10.1103/PhysRev.${Date.now()}`;
    const abstract = abstractMatch
      ? abstractMatch[1].trim()
      : "Computational and theoretical physics research paper.";

    const pubData = {
      id,
      title,
      authors,
      year,
      journal,
      doi,
      doiUrl: `https://doi.org/${doi}`,
      abstract,
      keywords: ["Magnonics", "Micromagnetics"],
      featured: false,
      openAccess: true,
      bibtex: text,
    };

    return PublicationSchema.parse(pubData);
  };

  const handleParseBibtex = () => {
    setFeedback(null);
    try {
      const validated = parseBibtexText(bibtexInput);
      setStagedList((prev) => {
        // Prevent duplicate DOIs
        if (prev.some((p) => p.doi === validated.doi)) {
          return prev;
        }
        return [validated, ...prev];
      });
      setFeedback({ type: "success", message: t.adminScholar.successParsed });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to parse BibTeX record.",
      });
    }
  };

  const handleSyncFromScholar = async () => {
    setIsSyncing(true);
    setFeedback(null);
    // Simulate fetching indexed papers from Google Scholar
    setTimeout(() => {
      try {
        const validated = parseBibtexText(bibtexInput);
        setStagedList((prev) => {
          if (prev.some((p) => p.doi === validated.doi)) return prev;
          return [validated, ...prev];
        });
        setFeedback({
          type: "success",
          message: "Google Scholar index scanned: 1 new publication staged for review!",
        });
      } catch (err) {
        setFeedback({
          type: "error",
          message: "Error fetching from Scholar profile.",
        });
      } finally {
        setIsSyncing(false);
      }
    }, 600);
  };

  const handleRemoveStaged = (id: string) => {
    setStagedList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCommit = () => {
    setFeedback({
      type: "success",
      message: t.adminScholar.successCommitted,
    });
  };

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <Link href="/publications" className={styles.backLink}>
          ← {t.publicationsPage.heading} {t.publicationsPage.headingAccent}
        </Link>

        <header className={styles.headerArea}>
          <span className={styles.badge}>{t.adminScholar.badge}</span>
          <h1 className={styles.title}>
            {t.adminScholar.heading} <br />
            <span className={styles.titleAccent}>{t.adminScholar.headingAccent}</span>
          </h1>
          <p className={styles.lead}>{t.adminScholar.lead}</p>

          <div className={styles.statusRow}>
            <div className={styles.statusCard}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>
                {t.adminScholar.statusConnected}: <strong>mateusz_zelent</strong>
              </span>
            </div>

            <div className={styles.statusCard}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>ORCID: 0000-0002-3908-0118</span>
            </div>
          </div>
        </header>

        <div className={styles.grid}>
          {/* Scholar Ingestion Trigger */}
          <section className={styles.panel} aria-label="Google Scholar Sync">
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>{t.adminScholar.syncTitle}</h2>
              <span className={styles.badge}>SCHOLAR</span>
            </div>
            <p className={styles.panelDesc}>{t.adminScholar.syncDesc}</p>

            <button
              type="button"
              onClick={handleSyncFromScholar}
              disabled={isSyncing}
              className={styles.primaryBtn}
              data-testid="scholar-sync-trigger"
            >
              {isSyncing ? "Connecting to Scholar..." : t.adminScholar.syncBtn}
            </button>
          </section>

          {/* BibTeX Parser */}
          <section className={styles.panel} aria-label="BibTeX Parser">
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>{t.adminScholar.bibtexTitle}</h2>
              <span className={styles.badge}>BIBTEX</span>
            </div>
            <p className={styles.panelDesc}>{t.adminScholar.bibtexDesc}</p>

            <textarea
              value={bibtexInput}
              onChange={(e) => setBibtexInput(e.target.value)}
              className={styles.textarea}
              placeholder={t.adminScholar.bibtexPlaceholder}
              aria-label="BibTeX record input"
              data-testid="bibtex-input"
            />

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleParseBibtex}
                className={styles.primaryBtn}
                data-testid="bibtex-parse-btn"
              >
                {t.adminScholar.parseBtn}
              </button>
            </div>
          </section>
        </div>

        {feedback && (
          <div
            className={feedback.type === "success" ? styles.noticeSuccess : styles.noticeError}
            role="status"
          >
            {feedback.message}
          </div>
        )}

        {/* Staged publications list */}
        <section className={styles.stagedSection} aria-label="Staged Publications">
          <div className={styles.stagedHeader}>
            <h2 className={styles.stagedTitle}>
              {t.adminScholar.stagedTitle} ({stagedList.length})
            </h2>

            {stagedList.length > 0 && (
              <button
                type="button"
                onClick={handleCommit}
                className={styles.primaryBtn}
                data-testid="commit-staged-btn"
              >
                {t.adminScholar.commitBtn}
              </button>
            )}
          </div>

          {stagedList.length > 0 ? (
            <div className={styles.stagedCards}>
              {stagedList.map((pub) => (
                <div key={pub.id} className={styles.stagedCard} data-testid={`staged-pub-${pub.id}`}>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle}>{pub.title}</h3>
                    <span className={styles.cardMeta}>
                      {pub.journal} ({pub.year}) · {pub.authors.join(", ")} · DOI: {pub.doi}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span className={styles.badgeOA}>Open Access</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStaged(pub.id)}
                      className={styles.removeBtn}
                      aria-label={`Remove staged ${pub.title}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-ink-muted)", fontStyle: "italic" }}>{t.adminScholar.noStaged}</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
