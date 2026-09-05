"use client";

import Link from "next/link";
import React from "react";

import { Footer } from "../../components/footer/Footer";
import { Header } from "../../components/navigation/Header";
import { softwareData } from "../../content/data/software";
import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./software.module.css";

export default function SoftwareDetailPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <Link href="/" className={styles.backLink}>
          {t.researchPage.backToHome}
        </Link>

        <header className={styles.headerArea}>
          <span className={styles.badge}>{t.softwarePage.badge}</span>
          <h1 className={styles.title}>
            {t.softwarePage.heading} <br />
            <span className={styles.titleAccent}>{t.softwarePage.headingAccent}</span>
          </h1>
          <p className={styles.lead}>{t.softwarePage.lead}</p>
        </header>

        <div className={styles.cardsContainer}>
          {softwareData.map((pkg) => (
            <article key={pkg.id} className={styles.softwareCard} aria-labelledby={`pkg-${pkg.id}`}>
              <div className={styles.cardHeader}>
                <div className={styles.titleGroup}>
                  <h2 id={`pkg-${pkg.id}`} className={styles.pkgName}>
                    {pkg.name}
                  </h2>
                  <span className={styles.pkgTagline}>{pkg.tagline}</span>
                </div>

                <div className={styles.badgesGroup}>
                  <span className={styles.langBadge}>{pkg.language}</span>
                  <span className={styles.licenseBadge}>License: {pkg.license}</span>
                </div>
              </div>

              <p className={styles.description}>{pkg.description}</p>

              <div className={styles.gridDetails}>
                <div className={styles.detailBlock}>
                  <h3 className={styles.detailTitle}>{t.softwarePage.keyFeatures}</h3>
                  <ul className={styles.highlightList}>
                    {pkg.highlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                </div>

                {pkg.quickstart && (
                  <div className={styles.detailBlock}>
                    <h3 className={styles.detailTitle}>{t.softwarePage.quickstart}</h3>
                    <div className={styles.codeBox}>
                      <code>{pkg.quickstart}</code>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.badgesGroup}>
                  {pkg.technologies.map((tech) => (
                    <span key={tech} className={styles.langBadge}>
                      {tech}
                    </span>
                  ))}
                </div>

                <a
                  href={pkg.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.repoBtn}
                  aria-label={`View ${pkg.name} on GitHub`}
                >
                  View on GitHub ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
