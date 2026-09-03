"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Footer } from "../../components/footer/Footer";
import { Header } from "../../components/navigation/Header";
import { grantsData } from "../../content/data/grants";
import { softwareData } from "../../content/data/software";
import styles from "./admin-dashboard.module.css";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pubCount, setPubCount] = useState<number>(0);
  const [postCount, setPostCount] = useState<number>(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        const blogRes = await fetch("/api/admin/blog");
        if (blogRes.ok) {
          const blogData = await blogRes.json();
          if (blogData.posts) {
            setPostCount(blogData.posts.length);
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
      router.replace("/admin/login");
    } catch {
      router.replace("/admin/login");
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className={styles.dashboardContainer}>
        <Header />
        <main id="main-content" className={styles.mainContent} tabIndex={-1}>
          <h1
            style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
          >
            Weryfikacja autoryzacji Panelu Administracyjnego
          </h1>
          <div style={{ textAlign: "center", padding: "8rem 0" }}>
            <p style={{ color: "var(--color-text-secondary)" }}>Weryfikacja tożsamości administratora...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        {/* Header Area */}
        <header className={styles.headerArea}>
          <div className={styles.badgeRow}>
            <span className={styles.badge}>
              <span className={styles.statusDot} aria-hidden="true" />
              Panel Administracyjny · Aktywna Sesja
            </span>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={styles.logoutBtn}
              aria-label="Wyloguj się z panelu administracyjnego"
            >
              {isLoggingOut ? "Wylogowywanie..." : "Wyloguj się"}
            </button>
          </div>

          <h1 className={styles.title}>
            Centrum Zarządzania <br />
            <span className={styles.titleAccent}>Portfelem Naukowym</span>
          </h1>

          <p className={styles.lead}>
            Bezpieczny kokpit do zarządzania publikacjami recenzowanymi, wpisami laboratoryjnymi w blogu,
            aparatami mikromagnetycznymi oraz zasobami multimedialnymi dra Mateusza Zelenta.
          </p>
        </header>

        {/* Live Metrics Grid */}
        <section className={styles.metricsGrid} aria-label="Statystyki bazy danych">
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Wpisy w Blogu</span>
            <span className={styles.metricValue}>{postCount}</span>
            <span className={styles.metricSubtext}>Notatki & obrazy laboratoryjne</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Publikacje JCR</span>
            <span className={styles.metricValue}>{pubCount}</span>
            <span className={styles.metricSubtext}>Zsynchronizowane z Google Scholar</span>
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
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
              <h3 className={styles.moduleHeading}>Blog & Media Studio</h3>
              <p className={styles.moduleDesc}>
                Dodawaj nowe wpisy laboratoryjne, wgrywaj zdjęcia mikroskopowe i spektroskopowe, określaj
                parametry techniczne (pole magnetyczne, temperatura, aparatura) oraz zarządzaj galerią.
              </p>
            </div>

            <ul className={styles.moduleFeatures}>
              <li className={styles.moduleFeatureItem}>
                Upload zdjęć z walidacją formatów (JPEG, PNG, WebP, AVIF)
              </li>
              <li className={styles.moduleFeatureItem}>Metadane aparatury i fizycznych warunków pomiaru</li>
              <li className={styles.moduleFeatureItem}>Edycja i usuwanie istniejących artykułów</li>
            </ul>

            <Link href="/admin/blog" className={styles.moduleActionBtn}>
              Otwórz Blog Studio →
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
                </svg>
              </span>
              <h3 className={styles.moduleHeading}>Katalog Publikacji & BibTeX</h3>
              <p className={styles.moduleDesc}>
                Importuj publikacje bezpośrednio z formatu BibTeX, synchronizuj profil Google Scholar,
                wyróżniaj kluczowe artykuły w sekcji głównej oraz modyfikuj abstrakty i identyfikatory DOI.
              </p>
            </div>

            <ul className={styles.moduleFeatures}>
              <li className={styles.moduleFeatureItem}>
                Automatyczny parser BibTeX (@article / @inproceedings)
              </li>
              <li className={styles.moduleFeatureItem}>
                Walidacja schematu Zod i unikalności identyfikatorów DOI
              </li>
              <li className={styles.moduleFeatureItem}>Trwały zapis do bazy danych repozytorium</li>
            </ul>

            <Link
              href="/admin/scholar"
              className={`${styles.moduleActionBtn} ${styles.moduleActionBtnAccent}`}
            >
              Zarządzaj Publikacjami →
            </Link>
          </div>

          {/* Module 3: Spintronics & Visual Lab */}
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
              po nieudanych próbach.
            </p>
          </div>

          <div className={styles.securityBadges}>
            <span className={styles.secBadge}>HttpOnly Cookie</span>
            <span className={styles.secBadge}>Sliding Window Limiter</span>
            <span className={styles.secBadge}>Zod Schema Validation</span>
            <span className={styles.secBadge}>File-System Persistence</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
