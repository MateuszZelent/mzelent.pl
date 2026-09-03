"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Footer } from "../../../components/footer/Footer";
import { Header } from "../../../components/navigation/Header";
import { useTranslation } from "../../../content/i18n/i18n-context";
import { type Publication, PublicationSchema } from "../../../content/schemas/publication.schema";
import type { ScholarAuthorStats } from "../../api/admin/scholar/sync/route";
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
  const router = useRouter();
  const { t } = useTranslation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [bibtexInput, setBibtexInput] = useState(INITIAL_SCHOLAR_SAMPLE);
  const [stagedList, setStagedList] = useState<Publication[]>([]);
  const [existingPubs, setExistingPubs] = useState<Publication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Live Scholar Sync states
  const [scholarStats, setScholarStats] = useState<ScholarAuthorStats | null>(null);
  const [scholarNewWorks, setScholarNewWorks] = useState<Publication[]>([]);
  const [scholarCitationUpdates, setScholarCitationUpdates] = useState<
    Array<{ id: string; title: string; oldCitations: number; newCitations: number }>
  >([]);

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const authRes = await fetch("/api/admin/auth");
        const authData = await authRes.json();

        if (!authData.authenticated) {
          router.replace("/admin/login");
          return;
        }

        setIsAuthenticated(true);

        const pubRes = await fetch("/api/admin/publications");
        if (pubRes.ok) {
          const pubData = await pubRes.json();
          if (pubData.publications) {
            setExistingPubs(pubData.publications);
          }
        }
      } catch {
        router.replace("/admin/login");
      }
    }

    checkAuthAndLoad();
  }, [router]);

  const parseBibtexText = (text: string): Publication => {
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

    try {
      const res = await fetch("/api/admin/scholar/sync?userId=XkzMx4IAAAAJ");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Błąd podczas synchronizacji z Google Scholar");
      }

      setScholarStats(data.stats);
      setScholarNewWorks(data.newWorks || []);
      setScholarCitationUpdates(data.citationUpdates || []);

      const newMsg =
        data.newWorks?.length > 0
          ? ` Znaleziono ${data.newWorks.length} nowych publikacji!`
          : " Wszystkie publikacje są już w bazie.";
      const updatesMsg =
        data.citationUpdates?.length > 0
          ? ` Wykryto ${data.citationUpdates.length} zmian liczby cytowań.`
          : "";

      setFeedback({
        type: "success",
        message: `Pobrano profil Scholar (XkzMx4IAAAAJ): ${data.stats.totalCitations} cytowań, h-indeks: ${data.stats.hIndex}, i10-indeks: ${data.stats.i10Index}.${newMsg}${updatesMsg}`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Błąd sieci podczas pobierania ze Scholar.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStageAllNewWorks = () => {
    if (scholarNewWorks.length === 0) return;
    setStagedList((prev) => {
      const combined = [...scholarNewWorks, ...prev];
      const seen = new Set<string>();
      return combined.filter((p) => {
        if (seen.has(p.title)) return false;
        seen.add(p.title);
        return true;
      });
    });
    setScholarNewWorks([]);
    setFeedback({
      type: "success",
      message: `Przeniesiono ${scholarNewWorks.length} prac ze Scholar do bufora (staged) do zatwierdzenia!`,
    });
  };

  const handleApplyCitationUpdates = async () => {
    setIsSyncing(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/scholar/sync?userId=XkzMx4IAAAAJ&updateCitations=true");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Błąd aktualizacji cytowań");

      setFeedback({
        type: "success",
        message: `Pomyślnie zaktualizowano liczbę cytowań dla ${data.citationsUpdatedInDb} publikacji w bazie!`,
      });

      // Synchronize profile stats
      if (data.stats) {
        await fetch("/api/admin/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metrics: {
              citations: data.stats.totalCitations,
              hIndex: data.stats.hIndex,
              i10Index: data.stats.i10Index,
            },
          }),
        });
      }

      // Refresh existing publications list
      const pubRes = await fetch("/api/admin/publications");
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (pubData.publications) setExistingPubs(pubData.publications);
      }

      setScholarCitationUpdates([]);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Błąd aktualizacji bazy cytowań.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveStaged = (id: string) => {
    setStagedList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCommit = async () => {
    if (stagedList.length === 0) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      for (const pub of stagedList) {
        const res = await fetch("/api/admin/publications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pub),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to commit publication to database");
        }
      }

      setFeedback({
        type: "success",
        message: `Pomyślnie zatwierdzono ${stagedList.length} publikacji do produkcyjnej bazy danych!`,
      });

      // Refresh list
      const pubRes = await fetch("/api/admin/publications");
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (pubData.publications) {
          setExistingPubs(pubData.publications);
        }
      }

      setStagedList([]);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Błąd podczas zapisu publikacji.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExisting = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę publikację z bazy?")) return;

    try {
      const res = await fetch("/api/admin/publications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setExistingPubs((prev) => prev.filter((p) => p.id !== id));
        setFeedback({ type: "success", message: "Publikacja usunięta pomyślnie z bazy." });
      } else {
        setFeedback({ type: "error", message: "Nie udało się usunąć publikacji." });
      }
    } catch {
      setFeedback({ type: "error", message: "Błąd sieci podczas usuwania publikacji." });
    }
  };

  const handleToggleFeatured = async (pub: Publication) => {
    const updated = { ...pub, featured: !pub.featured };

    try {
      const res = await fetch("/api/admin/publications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        setExistingPubs((prev) => prev.map((p) => (p.id === pub.id ? updated : p)));
      }
    } catch {
      setFeedback({ type: "error", message: "Błąd podczas aktualizacji publikacji." });
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <main id="main-content" className={styles.mainContent} tabIndex={-1}>
          <h1
            style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
          >
            Weryfikacja autoryzacji Katalogu Publikacji
          </h1>
          <div style={{ textAlign: "center", padding: "8rem 0" }}>
            <p style={{ color: "var(--color-ink-muted)" }}>Weryfikacja tożsamości administratora...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredExisting = existingPubs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.journal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.year.toString().includes(searchTerm),
  );

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <Link href="/admin" className={styles.backLink}>
            ← Panel Główny (/admin)
          </Link>
          <Link href="/publications" className={styles.backLink}>
            Zobacz Wykaz Publiczny →
          </Link>
        </div>

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
                {t.adminScholar.statusConnected}: <strong>XkzMx4IAAAAJ</strong> (Mateusz Zelent)
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
              <span className={styles.badge}>GOOGLE SCHOLAR</span>
            </div>
            <p className={styles.panelDesc}>
              Automatyczny serwerowy skaner profilu <code>XkzMx4IAAAAJ</code>. Pobiera aktualną liczbę
              cytowań, h-indeks oraz parsuje nowo opublikowane artykuły.
            </p>

            <button
              type="button"
              onClick={handleSyncFromScholar}
              disabled={isSyncing}
              className={styles.primaryBtn}
              data-testid="scholar-sync-trigger"
            >
              {isSyncing ? "Łączenie z Google Scholar..." : "Synchronizuj z Google Scholar (Auto-Sync) ↻"}
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

        {/* Live Scholar Stats and Actions Card */}
        {scholarStats && (
          <div className={styles.syncStatsCard}>
            <div className={styles.syncStatsHeader}>
              <h3 className={styles.syncStatsTitle}>
                Statystyki z Profilu Google Scholar (Użytkownik: XkzMx4IAAAAJ)
              </h3>
              <span className={styles.badge}>DANE NA ŻYWO</span>
            </div>

            <div className={styles.syncMetricsGrid}>
              <div className={styles.syncMetricItem}>
                <span className={styles.syncMetricVal}>{scholarStats.totalCitations}</span>
                <span className={styles.syncMetricLbl}>Wszystkie Cytowania</span>
              </div>
              <div className={styles.syncMetricItem}>
                <span className={styles.syncMetricVal}>{scholarStats.citationsSince2019}</span>
                <span className={styles.syncMetricLbl}>Cytowania (od 2019)</span>
              </div>
              <div className={styles.syncMetricItem}>
                <span className={styles.syncMetricVal}>{scholarStats.hIndex}</span>
                <span className={styles.syncMetricLbl}>h-indeks</span>
              </div>
              <div className={styles.syncMetricItem}>
                <span className={styles.syncMetricVal}>{scholarStats.i10Index}</span>
                <span className={styles.syncMetricLbl}>i10-indeks</span>
              </div>
            </div>

            <div className={styles.syncActionRow}>
              {scholarNewWorks.length > 0 && (
                <button type="button" onClick={handleStageAllNewWorks} className={styles.primaryBtn}>
                  Dodaj {scholarNewWorks.length} Nowych Prac ze Scholar do Bufora →
                </button>
              )}

              {scholarCitationUpdates.length > 0 && (
                <button
                  type="button"
                  onClick={handleApplyCitationUpdates}
                  disabled={isSyncing}
                  className={styles.secondaryBtn}
                >
                  Zaktualizuj Liczby Cytowań w Bazie ({scholarCitationUpdates.length} zmian)
                </button>
              )}
            </div>
          </div>
        )}

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
                disabled={isSaving}
                className={styles.primaryBtn}
                data-testid="commit-staged-btn"
              >
                {isSaving ? "Zapisywanie w bazie..." : t.adminScholar.commitBtn}
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

                  <div className={styles.cardActions}>
                    <span className={styles.badgeOA}>Open Access</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStaged(pub.id)}
                      className={styles.removeBtn}
                      aria-label={`Remove staged ${pub.title}`}
                    >
                      Usuń z bufora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-ink-muted)", fontStyle: "italic" }}>{t.adminScholar.noStaged}</p>
          )}
        </section>

        {/* Existing publications repository management */}
        <section className={styles.existingPubsSection} aria-label="Existing Publications in Database">
          <h2 className={styles.stagedTitle}>Baza Opublikowanych Artykułów ({existingPubs.length})</h2>

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Filtruj publikacje (tytuł, czasopismo, rok)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              aria-label="Filtruj publikacje w bazie"
            />
          </div>

          <div className={styles.stagedCards}>
            {filteredExisting.slice(0, 20).map((pub) => (
              <div key={pub.id} className={styles.stagedCard}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{pub.title}</h3>
                  <span className={styles.cardMeta}>
                    {pub.journal} ({pub.year}) · {pub.authors.join(", ")} · Cytowania: {pub.citations || 0}
                  </span>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(pub)}
                    className={`${styles.featureBtn} ${pub.featured ? styles.featureBtnActive : ""}`}
                    title="Przełącz status wyróżnionej publikacji na stronie głównej"
                  >
                    {pub.featured ? "★ Wyróżniona" : "☆ Zwykła"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteExisting(pub.id)}
                    className={styles.removeBtn}
                    aria-label={`Usuń publikację ${pub.title}`}
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
