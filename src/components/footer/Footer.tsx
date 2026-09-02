"use client";

import Link from "next/link";
import React from "react";

import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useTranslation();

  const scrollToTop = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.brandCol}>
            <span className={styles.brandTitle}>MATEUSZ ZELENT</span>
            <p className={styles.brandDesc}>{t.footer.roleBio}</p>
            <div className={styles.externalLinks}>
              <a
                href="https://orcid.org/0000-0002-3908-0118"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerExternalLink}
                aria-label="ORCID profile: 0000-0002-3908-0118"
              >
                ORCID: 0000-0002-3908-0118 ↗
              </a>
              <a
                href="https://github.com/MateuszZelent"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerExternalLink}
                aria-label="GitHub profile: MateuszZelent"
              >
                GitHub ↗
              </a>
              <a
                href="https://rptu.de"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerExternalLink}
                aria-label="RPTU Kaiserslautern-Landau"
              >
                RPTU ↗
              </a>
            </div>
          </div>

          <div className={styles.linksCol}>
            <span className={styles.colTitle}>{t.footer.navigationTitle}</span>
            <ul className={styles.linkList}>
              <li>
                <a href="#research" className={styles.footerLink}>
                  {t.nav.research}
                </a>
              </li>
              <li>
                <a href="#grants" className={styles.footerLink}>
                  {t.nav.grants}
                </a>
              </li>
              <li>
                <a href="#software" className={styles.footerLink}>
                  {t.nav.software}
                </a>
              </li>
              <li>
                <Link href="/publications" className={styles.footerLink}>
                  {t.nav.publications}
                </Link>
              </li>
              <li>
                <Link href="/lab/visual-system?tier=medium" className={styles.footerLink}>
                  {t.nav.visualLab}
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <span className={styles.colTitle}>{t.footer.architectureTitle}</span>
            <ul className={styles.linkList}>
              <li>
                <span className={styles.stackTag}>Next.js 16 App Router</span>
              </li>
              <li>
                <span className={styles.stackTag}>Three.js WebGL2 & GLSL</span>
              </li>
              <li>
                <span className={styles.stackTag}>GPU Ping-Pong FBO</span>
              </li>
              <li>
                <span className={styles.stackTag}>Zod Content Schemas</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Mateusz Zelent. {t.footer.copyright}
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className={styles.backToTop}
            aria-label={t.footer.backToTop}
          >
            <span>{t.footer.backToTop}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
