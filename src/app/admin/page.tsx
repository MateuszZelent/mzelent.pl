"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Footer } from "../../components/footer/Footer";
import { Header } from "../../components/navigation/Header";
import { grantsData } from "../../content/data/grants";
import { profileData } from "../../content/data/profile";
import { softwareData } from "../../content/data/software";
import styles from "./admin-dashboard.module.css";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pubCount, setPubCount] = useState<number>(0);
  const [postCount, setPostCount] = useState<number>(0);
  const [profile, setProfile] = useState(profileData);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSyncingScholar, setIsSyncingScholar] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    async function verifyAuthAndFetchStats() {
      try {
        const authRes = await fetch("/api/admin/auth");
        const authData = await authRes.json();

        if (!authData.authenticated) {
          router.replace("/admin/login");
          return;
        }

        setIsAuthenticated(true);

        // Fetch publications count
        const pubRes = await fetch("/api/admin/publications");
        if (pubRes.ok) {
          const pubData = await pubRes.json();
          if (pubData.publications) {
            setPubCount(pubData.publications.length);
          }
        }

        // Fetch blog posts count
        const blogRes = await fetch("/api/blog");
        if (blogRes.ok) {
          const blogData = await blogRes.json();
          if (blogData.posts) {
            setPostCount(blogData.posts.length);
          }
        }

        // Fetch profile
        const profRes = await fetch("/api/profile");
        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData.profile) {
            setProfile(profData.profile);
          }
        }
      } catch {
        router.replace("/admin/login");
      }
    }

    verifyAuthAndFetchStats();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleQuickScholarSync = async () => {
    setIsSyncingScholar(true);
    setSyncNotice(null);

    try {
      const res = await fetch("/api/admin/scholar/sync?userId=XkzMx4IAAAAJ&updateCitations=true");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Błąd synchronizacji ze Scholar");
      }

      if (data.stats) {
        setProfile((prev) => ({
          ...prev,
          metrics: {
            citations: data.stats.totalCitations,
            hIndex: data.stats.hIndex,
            i10Index: data.stats.i10Index,
          },
        }));

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

      setSyncNotice(
        `Zsynchronizowano! Profil Google Scholar: ${data.stats.totalCitations} cytowań, h-indeks: ${data.stats.hIndex}, zaktualizowano ${data.citationsUpdatedInDb} prac w bazie.`,
      );
    } catch (err) {
      setSyncNotice(err instanceof Error ? err.message : "Błąd synchronizacji.");
    } finally {
      setIsSyncingScholar(false);
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
            Weryfikacja autoryzacji panelu administracyjnego
          </h1>
          <div style={{ textAlign: "center", padding: "8rem 0" }}>
            <p style={{ color: "var(--color-ink-muted)" }}>Weryfikacja tożsamości administratora...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        {/* Header and Logout Controls */}
        <header className={styles.headerArea}>
          <div className={styles.headerTop}>
            <div className={styles.badgeRow}>
              <span className={styles.badge}>KOKPIT NAUKOWY</span>
              <span className={styles.systemStatus}>
                <span className={styles.statusDot} aria-hidden="true" />
                SYSTEM ONLINE · NEXT.JS 16
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={styles.logoutBtn}
              aria-label="Wyloguj się z panelu administracyjnego"
            >
              {isLoggingOut ? "Wylogowywanie..." : "Wyloguj się ⎋"}
            </button>
          </div>

          <h1 className={styles.title}>
            Panel Administracyjny <br />
            <span className={styles.titleAccent}>Zarządzanie Portfelem Naukowym</span>
          </h1>
          <p className={styles.lead}>
            Centralny punkt kontrolny portalu mzelent.pl. Zarządzaj publikacjami z Google Scholar, publikuj
            wpisy laboratoryjne ze zdjęciami aparatury oraz monitoruj wskaźniki naukowe.
          </p>
        </header>

        {/* Live Metrics Grid */}
        <section className={styles.metricsGrid} aria-label="Statystyki bazy danych">
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Wpisy w Blogu</span>
            <span className={styles.metricValue}>{postCount || 7}</span>
            <span className={styles.metricSubtext}>Notatki & obrazy laboratoryjne</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Publikacje JCR</span>
            <span className={styles.metricValue}>{pubCount || 44}</span>
            <span className={styles.metricSubtext}>Zsynchronizowane ze Scholar</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Cytowania (Scholar)</span>
            <span className={styles.metricValue}>{profile.metrics?.citations ?? 755}</span>
            <span className={styles.metricSubtext}>Indeks Google Scholar</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>h-indeks / i10</span>
            <span className={styles.metricValue}>
              {profile.metrics?.hIndex ?? 16} / {profile.metrics?.i10Index ?? 21}
            </span>
            <span className={styles.metricSubtext}>Wskaźniki bibliometryczne</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Projekty & Granty</span>
            <span className={styles.metricValue}>{grantsData.length}</span>
            <span className={styles.metricSubtext}>Horyzont Europa MSCA & NCN</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Pakiety Software</span>
            <span className={styles.metricValue}>{softwareData.length}</span>
            <span className={styles.metricSubtext}>Narzędzia magnoniczne open-source</span>
          </div>
        </section>

        {syncNotice && (
          <div
            style={{
              margin: "1.5rem 0",
              padding: "1rem 1.25rem",
              background: "rgba(0, 242, 254, 0.08)",
              border: "1px solid var(--accent-cyan)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-ink)",
              fontSize: "0.9rem",
              fontFamily: "var(--font-mono, monospace)",
            }}
            role="status"
          >
            {syncNotice}
          </div>
        )}

        {/* Core Administrative Modules */}
        <h2 className={styles.sectionTitle}>Moduły Administracyjne</h2>

        <section className={styles.modulesGrid} aria-label="Moduły panelu">
          {/* Module 1: Blog & Media Studio */}
          <div className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <span className={styles.moduleIcon} aria-hidden="true">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </span>
              <h3 className={styles.moduleHeading}>Research Blog & Media Studio</h3>
              <p className={styles.moduleDesc}>
                Twórz nowe wpisy z badań laboratoryjnych, przesyłaj zdjęcia aparatury (SEM, BLS, lasery) oraz
                modyfikuj parametry techniczne pomiarów (pole B, temperatura T, aparatura).
              </p>
            </div>

            <ul className={styles.moduleFeatures}>
              <li className={styles.moduleFeatureItem}>Pełny formularz publikacji i tryb edycji wpisów</li>
              <li className={styles.moduleFeatureItem}>Upload grafik do katalogu publicznego</li>
              <li className={styles.moduleFeatureItem}>Automatyczna aktualizacja strony /blog w locie</li>
            </ul>

            <Link href="/admin/blog" className={styles.moduleActionBtn}>
              Otwórz Studio Wpisów →
            </Link>
          </div>

          {/* Module 2: Scholar Publications */}
          <div className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <span className={styles.moduleIcon} aria-hidden="true">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                  <path d="M6 14h7" />
                </svg>
              </span>
              <h3 className={styles.moduleHeading}>Katalog Publikacji & BibTeX</h3>
              <p className={styles.moduleDesc}>
                Automatycznie synchronizuj artykuły z profilem Google Scholar (XkzMx4IAAAAJ), importuj rekordy
                BibTeX, zarządzaj bazą i oznaczaj wyróżnione publikacje.
              </p>
            </div>

            <ul className={styles.moduleFeatures}>
              <li className={styles.moduleFeatureItem}>Auto-Sync z Google Scholar (59 prac, 755 cytowań)</li>
              <li className={styles.moduleFeatureItem}>Walidacja schematem Zod z deduplikacją DOI</li>
              <li className={styles.moduleFeatureItem}>Przełączanie wyróżnień na stronie głównej (★)</li>
            </ul>

            <Link
              href="/admin/scholar"
              className={`${styles.moduleActionBtn} ${styles.moduleActionBtnAccent}`}
            >
              Zarządzaj Publikacjami →
            </Link>
          </div>

          {/* Module 3: Researcher Profile & Scholar Sync */}
          <div className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <span className={styles.moduleIcon} aria-hidden="true">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <h3 className={styles.moduleHeading}>Profil Naukowy & Metryki</h3>
              <p className={styles.moduleDesc}>
                Zarządzaj danymi biogramu, afiliacją UAM / RPTU, kontaktami oraz aktualizuj wskaźniki cytowań
                bezpośrednio z serwerów Google Scholar.
              </p>
            </div>

            <ul className={styles.moduleFeatures}>
              <li className={styles.moduleFeatureItem}>Afiliacja: UAM Poznań & RPTU Kaiserslautern</li>
              <li className={styles.moduleFeatureItem}>ORCID: 0000-0002-3908-0118 · Scholar: XkzMx4IAAAAJ</li>
              <li className={styles.moduleFeatureItem}>
                Wskaźniki: {profile.metrics?.citations ?? 755} cytowań, h-indeks{" "}
                {profile.metrics?.hIndex ?? 16}
              </li>
            </ul>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={handleQuickScholarSync}
                disabled={isSyncingScholar}
                className={styles.moduleActionBtn}
                style={{ flex: 1, minWidth: "180px", textAlign: "center" }}
              >
                {isSyncingScholar ? "Pobieranie ze Scholar..." : "Auto-Sync Scholar ↻"}
              </button>
              <Link href="/cv" className={styles.moduleActionBtn} style={{ flex: "0 0 auto" }}>
                Podgląd CV →
              </Link>
            </div>
          </div>

          {/* Module 4: Spintronics & Visual Lab */}
          <div className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <span className={styles.moduleIcon} aria-hidden="true">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="2" />
                  <path d="M20.2 20.2c2.4-2.4 2.4-6.3 0-8.7l-7.7-7.7a6.16 6.16 0 0 0-8.7 0 6.16 6.16 0 0 0 0 8.7l7.7 7.7c2.4 2.4 6.3 2.4 8.7 0Z" />
                  <path d="M3.8 20.2c-2.4-2.4-2.4-6.3 0-8.7l7.7-7.7a6.16 6.16 0 0 1 8.7 0 6.16 6.16 0 0 1 0 8.7l-7.7 7.7c-2.4 2.4-6.3 2.4-8.7 0Z" />
                </svg>
              </span>
              <h3 className={styles.moduleHeading}>Laboratorium Spintroniki 3D</h3>
              <p className={styles.moduleDesc}>
                Eksperymentuj z parametrami symulatora skyrmionów (DMI, pole zewnętrzne, tłumienie Gilberta),
                testuj profile jakości WebGL2 oraz sprawdzaj diagnostykę renderowania klatek.
              </p>
            </div>

            <ul className={styles.moduleFeatures}>
              <li className={styles.moduleFeatureItem}>Testowanie modeli skyrmiona Néela i Blocha w 3D</li>
              <li className={styles.moduleFeatureItem}>Paleta MMPP HSL cone (+z biały, -z czarny)</li>
              <li className={styles.moduleFeatureItem}>Narzędzia diagnostyczne GPU, FPS i draw-calls</li>
            </ul>

            <Link href="/lab/visual-system" className={styles.moduleActionBtn}>
              Otwórz Laboratorium 3D →
            </Link>
          </div>
        </section>

        {/* Security & System Status */}
        <section className={styles.securityBanner} aria-label="Status zabezpieczeń">
          <div className={styles.securityInfo}>
            <span className={styles.securityTitle}>Zabezpieczenia & Kontrola Dostępu</span>
            <p className={styles.securityText}>
              Sesja zabezpieczona kryptograficznie ciasteczkiem HttpOnly. Ochrona Rate-Limiting z blokadą IP
              po nieudanych próbach. Walidacja schematami Zod i persystencja w strukturze plików repozytorium.
            </p>
          </div>

          <div className={styles.securityTags}>
            <span className={styles.securityTag}>HTTPONLY COOKIE</span>
            <span className={styles.securityTag}>SLIDING WINDOW LIMITER</span>
            <span className={styles.securityTag}>ZOD VALIDATION</span>
            <span className={styles.securityTag}>FILE PERSISTENCE</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
