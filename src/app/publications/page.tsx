"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import { Footer } from "../../components/footer/Footer";
import { Header } from "../../components/navigation/Header";
import { publications } from "../../content";
import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./publications.module.css";

export default function PublicationsPage() {
  const { t } = useTranslation();
  const [pubsList, setPubsList] = useState(publications);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJournal, setSelectedJournal] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/publications")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.publications && Array.isArray(data.publications)) {
          setPubsList(data.publications);
        }
      })
      .catch(() => {});
  }, []);

  const journals = useMemo(() => {
    const set = new Set<string>();
    pubsList.forEach((pub) => set.add(pub.journal));
    return Array.from(set);
  }, [pubsList]);

  const filteredPublications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return pubsList.filter((pub) => {
      const matchesJournal = selectedJournal === "ALL" || pub.journal === selectedJournal;
      if (!matchesJournal) return false;

      if (!query) return true;

      const titleMatch = pub.title.toLowerCase().includes(query);
      const authorMatch = pub.authors.some((author) => author.toLowerCase().includes(query));
      const keywordMatch = pub.keywords.some((kw) => kw.toLowerCase().includes(query));
      const journalMatch = pub.journal.toLowerCase().includes(query);
      const yearMatch = pub.year.toString().includes(query);

      return titleMatch || authorMatch || keywordMatch || journalMatch || yearMatch;
    });
  }, [pubsList, searchQuery, selectedJournal]);

  const handleCopyBibtex = async (id: string, bibtex: string) => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback if clipboard permission denied
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <Link href="/" className={styles.backLink}>
          {t.publicationsPage.backToHome}
        </Link>

        <header className={styles.headerArea}>
          <span className={styles.pageTag}>Scientific Bibliography</span>
          <h1 className={styles.pageHeading}>
            {t.publicationsPage.heading} <br />
            <span className={styles.headingAccent}>{t.publicationsPage.headingAccent}</span>
          </h1>
          <p className={styles.pageSubheading}>{t.publicationsPage.subheading}</p>

          <div className={styles.scholarNotice}>
            <span className={styles.scholarDot} aria-hidden="true" />
            <span>{t.publicationsPage.syncNotice}</span>
            <a
              href="https://scholar.google.pl/citations?user=XkzMx4IAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.adminLink}
              aria-label="Google Scholar Profile"
            >
              [Google Scholar Profile ↗]
            </a>
          </div>

          <div className={styles.statsStrip} aria-label="Google Scholar Bibliometric Metrics">
            <div className={styles.statCard}>
              <span className={styles.statValue}>755+</span>
              <span className={styles.statLabel}>{t.publicationsPage.citationsLabel}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>16</span>
              <span className={styles.statLabel}>h-index</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>21</span>
              <span className={styles.statLabel}>i10-index</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{publications.length}</span>
              <span className={styles.statLabel}>{t.publicationsPage.articlesLabel}</span>
            </div>
          </div>
        </header>

        <section className={styles.controlsBar} aria-label="Publication search and filtering">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.publicationsPage.searchPlaceholder}
            className={styles.searchInput}
            aria-label={t.publicationsPage.searchPlaceholder}
          />

          <div className={styles.filterRow}>
            <div className={styles.filterChips} role="group" aria-label="Filter by journal">
              <button
                type="button"
                className={`${styles.chip} ${selectedJournal === "ALL" ? styles.chipActive : ""}`}
                onClick={() => setSelectedJournal("ALL")}
                aria-pressed={selectedJournal === "ALL"}
              >
                {t.publicationsPage.allJournals}
              </button>

              {journals.map((journal) => (
                <button
                  key={journal}
                  type="button"
                  className={`${styles.chip} ${selectedJournal === journal ? styles.chipActive : ""}`}
                  onClick={() => setSelectedJournal(journal)}
                  aria-pressed={selectedJournal === journal}
                >
                  {journal}
                </button>
              ))}
            </div>

            <span className={styles.countLabel}>
              {t.publicationsPage.totalFound} <strong>{filteredPublications.length}</strong>
            </span>
          </div>
        </section>

        {filteredPublications.length > 0 ? (
          <div className={styles.publicationsList}>
            {filteredPublications.map((pub) => (
              <article
                key={pub.id}
                className={styles.publicationCard}
                data-testid={`pub-page-card-${pub.id}`}
              >
                <div className={styles.metaRow}>
                  <span className={styles.journalPill}>{pub.journal}</span>
                  <span className={styles.yearPill}>{pub.year}</span>
                  {typeof pub.citations === "number" && pub.citations > 0 && (
                    <span className={styles.citationsBadge}>Cited: {pub.citations}</span>
                  )}
                  {pub.openAccess && (
                    <span className={styles.openAccessBadge}>{t.publications.openAccess}</span>
                  )}
                </div>

                <h2 className={styles.paperTitle}>{pub.title}</h2>
                <p className={styles.paperAuthors}>{pub.authors.join(", ")}</p>
                <p className={styles.paperAbstract}>{pub.abstract}</p>

                <div className={styles.cardFooter}>
                  <div className={styles.linksGroup}>
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

                    <button
                      type="button"
                      onClick={() => handleCopyBibtex(pub.id, pub.bibtex)}
                      className={styles.bibtexBtn}
                      aria-label={`Copy BibTeX for: ${pub.title}`}
                    >
                      {copiedId === pub.id ? t.publications.copied : t.publications.copyBibtex}
                    </button>
                  </div>

                  <div className={styles.keywords}>
                    {pub.keywords.map((kw) => (
                      <span key={kw} className={styles.keyword}>
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <p>{t.publicationsPage.noResults}</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
