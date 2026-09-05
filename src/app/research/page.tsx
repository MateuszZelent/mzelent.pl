"use client";

import Link from "next/link";
import React from "react";

import { Footer } from "../../components/footer/Footer";
import { Header } from "../../components/navigation/Header";
import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./research.module.css";

export default function ResearchDetailPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <Link href="/" className={styles.backLink}>
          {t.researchPage.backToHome}
        </Link>

        <header className={styles.headerArea}>
          <span className={styles.badge}>{t.researchPage.badge}</span>
          <h1 className={styles.title}>
            {t.researchPage.heading} <br />
            <span className={styles.titleAccent}>{t.researchPage.headingAccent}</span>
          </h1>
          <p className={styles.lead}>{t.researchPage.lead}</p>
        </header>

        <div className={styles.domainSections}>
          {/* Domain 1: Topological Solitons & Chiral Skyrmions */}
          <article className={styles.domainCard} aria-labelledby="domain-1-title">
            <div className={styles.domainContent}>
              <span className={styles.domainIndex}>AXIS 01 // TOPOLOGICAL TEXTURES</span>
              <h2 id="domain-1-title" className={styles.domainHeading}>
                {t.researchPage.domain1Title}
              </h2>
              <p className={styles.domainDesc}>{t.researchPage.domain1Desc}</p>

              <div className={styles.equationBlock} aria-label="DMI Energy Functional">
                <code>{t.researchPage.domain1Math}</code>
              </div>

              <div className={styles.linkGroup}>
                <Link href="/publications?search=skyrmion" className={styles.actionLink}>
                  Explore Related Publications (PRB 2021, PRB 2020) →
                </Link>
                <Link href="/cv" className={styles.actionLink}>
                  NCN SONATA-18 Grant Details →
                </Link>
              </div>
            </div>

            {/* Vector Field Visualization */}
            <div className={styles.interactiveDiagram} aria-label="Chiral Skyrmion Vector Texture">
              <svg viewBox="0 0 200 200" width="180" height="180" fill="none">
                {/* Background Core Glow */}
                <circle cx="100" cy="100" r="80" fill="url(#coreGlow)" opacity="0.4" />
                <circle cx="100" cy="100" r="30" fill="var(--accent-warm)" opacity="0.3" />

                {/* Skyrmion Swirl Arrows */}
                <g stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round">
                  {/* Concentric rings of spins */}
                  {[25, 45, 65, 80].map((radius, rIdx) => {
                    const count = 6 + rIdx * 4;
                    return Array.from({ length: count }).map((_, aIdx) => {
                      const angle = (aIdx * 2 * Math.PI) / count;
                      const x = 100 + radius * Math.cos(angle);
                      const y = 100 + radius * Math.sin(angle);
                      // Inward/outward tilt + swirl angle
                      const tilt = (radius / 80) * 0.5;
                      const dx = 10 * Math.cos(angle + 0.8 * tilt);
                      const dy = 10 * Math.sin(angle + 0.8 * tilt);
                      return (
                        <line
                          key={`${rIdx}-${aIdx}`}
                          x1={x}
                          y1={y}
                          x2={x + dx}
                          y2={y + dy}
                          opacity={0.3 + (radius / 80) * 0.7}
                        />
                      );
                    });
                  })}
                </g>

                {/* Core Spin pointing down */}
                <circle cx="100" cy="100" r="5" fill="var(--accent-warm)" />
                <path d="M96 100h8 M100 96v8" stroke="#000" strokeWidth="1.5" />

                <defs>
                  <radialGradient id="coreGlow">
                    <stop offset="0%" stopColor="var(--accent-warm)" />
                    <stop offset="60%" stopColor="var(--accent-cyan)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
              <span className={styles.diagramCaption}>
                Figure 1: Néel-type chiral skyrmion vector field texture [Q = -1]
              </span>
            </div>
          </article>

          {/* Domain 2: Spin-Wave Optics & Graded Refractive Media */}
          <article className={styles.domainCard} aria-labelledby="domain-2-title">
            <div className={styles.domainContent}>
              <span className={styles.domainIndex}>AXIS 02 // WAVE PHENOMENA</span>
              <h2 id="domain-2-title" className={styles.domainHeading}>
                {t.researchPage.domain2Title}
              </h2>
              <p className={styles.domainDesc}>{t.researchPage.domain2Desc}</p>

              <div className={styles.equationBlock} aria-label="Magnonic Refractive Index Formula">
                <code>{t.researchPage.domain2Math}</code>
              </div>

              <div className={styles.linkGroup}>
                <Link href="/publications?search=caustic" className={styles.actionLink}>
                  Explore Wave Optics Articles (APL 2022) →
                </Link>
                <Link href="/software" className={styles.actionLink}>
                  Computational Packages (MMPP) →
                </Link>
              </div>
            </div>

            {/* Graded Lens Ray / Wave Visualization */}
            <div className={styles.interactiveDiagram} aria-label="Magnonic Caustic Focalization">
              <svg viewBox="0 0 200 200" width="180" height="180" fill="none">
                {/* Wavefronts propagating and converging */}
                <g stroke="var(--accent-cyan)" strokeWidth="1.5" opacity="0.6">
                  <path d="M20 50 Q 80 50 140 100" />
                  <path d="M20 75 Q 80 75 140 100" />
                  <path d="M20 100 L 140 100" strokeDasharray="3 3" />
                  <path d="M20 125 Q 80 125 140 100" />
                  <path d="M20 150 Q 80 150 140 100" />
                </g>

                {/* Caustic Envelope */}
                <path
                  d="M40 30 C 90 70, 120 90, 150 100 C 120 110, 90 130, 40 170"
                  stroke="var(--accent-warm)"
                  strokeWidth="2"
                  opacity="0.85"
                />

                {/* Focal Hotspot */}
                <circle cx="150" cy="100" r="6" fill="var(--accent-warm)" />
                <circle cx="150" cy="100" r="16" stroke="var(--accent-warm)" opacity="0.3" />

                {/* Refractive gradient background */}
                <rect
                  x="20"
                  y="30"
                  width="140"
                  height="140"
                  rx="4"
                  stroke="var(--color-line-medium)"
                  opacity="0.4"
                />
              </svg>
              <span className={styles.diagramCaption}>
                Figure 2: Graded-index spin-wave caustic focalization cusp
              </span>
            </div>
          </article>

          {/* Domain 3: GPU Micromagnetics & Neuromorphic Reservoirs */}
          <article className={styles.domainCard} aria-labelledby="domain-3-title">
            <div className={styles.domainContent}>
              <span className={styles.domainIndex}>AXIS 03 // MSCA HORIZON EUROPE CNMA</span>
              <h2 id="domain-3-title" className={styles.domainHeading}>
                {t.researchPage.domain3Title}
              </h2>
              <p className={styles.domainDesc}>{t.researchPage.domain3Desc}</p>

              <div className={styles.equationBlock} aria-label="Landau-Lifshitz-Gilbert LLG Equation">
                <code>{t.researchPage.domain3Math}</code>
              </div>

              <div className={styles.linkGroup}>
                <a
                  href="https://rptu.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionLink}
                >
                  RPTU Kaiserslautern-Landau Host Lab (Prof. P. Pirro) ↗
                </a>
                <Link href="/#grants" className={styles.actionLink}>
                  CNMA Grant Overview (GA 101108257) →
                </Link>
              </div>
            </div>

            {/* Limit Cycle Orbit Visualization */}
            <div className={styles.interactiveDiagram} aria-label="Auto-Oscillator Limit Cycle Orbit">
              <svg viewBox="0 0 200 200" width="180" height="180" fill="none">
                {/* Unit Sphere Outline */}
                <circle cx="100" cy="100" r="65" stroke="var(--color-line-medium)" opacity="0.5" />
                <ellipse cx="100" cy="100" rx="65" ry="24" stroke="var(--color-line-medium)" opacity="0.3" />

                {/* Precession Trajectory Orbit */}
                <ellipse
                  cx="100"
                  cy="75"
                  rx="48"
                  ry="18"
                  stroke="var(--accent-cyan)"
                  strokeWidth="2"
                  opacity="0.9"
                />
                {/* Spin Vector */}
                <line x1="100" y1="100" x2="136" y2="72" stroke="var(--accent-warm)" strokeWidth="2.5" />
                <polygon points="136,72 130,73 134,77" fill="var(--accent-warm)" />

                {/* Coordinate Axes */}
                <line
                  x1="100"
                  y1="30"
                  x2="100"
                  y2="170"
                  stroke="var(--color-line-medium)"
                  opacity="0.4"
                  strokeDasharray="2 2"
                />
                <text x="105" y="42" fill="var(--color-ink-muted)" fontSize="10" fontFamily="monospace">
                  +mz
                </text>
              </svg>
              <span className={styles.diagramCaption}>
                Figure 3: Non-stationary limit-cycle auto-oscillation on the Bloch sphere
              </span>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
