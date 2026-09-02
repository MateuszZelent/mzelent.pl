"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./Header.module.css";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <a href="#main-content" className="skip-link" aria-label="Skip to main content">
        {language === "pl" ? "Przejdź do treści głównej" : "Skip to main content"}
      </a>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand} aria-label="Mateusz Zelent Homepage">
          <span className={styles.brandMark}>MZ</span>
          <span className={styles.brandText}>mzelent.pl</span>
        </Link>

        <nav className={styles.nav} aria-label="Main Navigation">
          <ul className={styles.navList}>
            <li>
              <a href="#research" className={styles.navLink}>
                {t.nav.research}
              </a>
            </li>
            <li>
              <a href="#grants" className={styles.navLink}>
                {t.nav.grants}
              </a>
            </li>
            <li>
              <a href="#software" className={styles.navLink}>
                {t.nav.software}
              </a>
            </li>
            <li>
              <Link href="/publications" className={styles.navLink}>
                {t.nav.publications}
              </Link>
            </li>
            <li>
              <Link href="/cv" className={styles.navLink}>
                {t.nav.cv}
              </Link>
            </li>
            <li>
              <Link href="/lab/visual-system?tier=medium" className={styles.navLink}>
                {t.nav.visualLab}
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.headerRight}>
          <div className={styles.langSwitch} role="group" aria-label="Language selection">
            <button
              type="button"
              className={`${styles.langBtn} ${language === "pl" ? styles.langBtnActive : ""}`}
              onClick={() => setLanguage("pl")}
              aria-pressed={language === "pl"}
              aria-label="Wersja polska"
            >
              PL
            </button>
            <span className={styles.langSep} aria-hidden="true">
              /
            </span>
            <button
              type="button"
              className={`${styles.langBtn} ${language === "en" ? styles.langBtnActive : ""}`}
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              aria-label="English version"
            >
              EN
            </button>
          </div>

          <div className={styles.statusIndicator} title={`Status: ${t.nav.activeResearch}`}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>{t.nav.activeResearch}</span>
          </div>

          <Link href="/lab/visual-system?tier=medium" className={styles.labButton}>
            {t.nav.labSandbox}
          </Link>
        </div>
      </div>
    </header>
  );
}
