"use client";

import Link from "next/link";
import React, { useRef } from "react";

import { researchDomains } from "../../content";
import { useTranslation } from "../../content/i18n/i18n-context";
import { ParallaxModel3D } from "../visual/ParallaxModel3D";
import styles from "./ResearchGrid.module.css";

export function ResearchGrid() {
  const containerRef = useRef<HTMLElement>(null);
  const { t, language } = useTranslation();

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section id="research" ref={containerRef} className={styles.section} aria-label="Research Domains">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <span>{t.researchGrid.tag}</span>
          </div>
          <h2 className={styles.sectionTitle}>
            {t.researchGrid.title} <br />
            <span className={styles.sectionTitleAccent}>{t.researchGrid.titleAccent}</span>
          </h2>
          <p className={styles.sectionLead}>{t.researchGrid.lead}</p>
        </div>

        <div className={styles.grid}>
          {researchDomains.map((domain) => {
            const isFeatured = domain.id === "gpu-vector-fields";
            const modelConfig =
              domain.id === "topological-solitons"
                ? {
                    src: "/assets/images/3d/skyrmion-3d.webp",
                    alt: "Chiral Magnetic Skyrmion 3D spin texture with DMI interaction",
                    badgeText: "3D Chiral Skyrmion · Q = -1",
                    watermark: "DMI SOLITON",
                    glowColor: "rgba(87, 230, 221, 0.55)",
                    secondaryGlowColor: "rgba(230, 163, 87, 0.35)",
                    flyInOffset: 90,
                    parallaxFactor: 0.22,
                  }
                : domain.id === "spin-wave-optics"
                  ? {
                      src: "/assets/images/3d/spinwaves-3d.webp",
                      alt: "Magnonic Wavepacket and Spin Wave Optics in Graded Media",
                      badgeText: "3D Spin-Wave Wavepacket",
                      watermark: "n(r) DISPERSION",
                      glowColor: "rgba(87, 230, 221, 0.55)",
                      secondaryGlowColor: "rgba(230, 190, 87, 0.3)",
                      flyInOffset: 110,
                      parallaxFactor: 0.25,
                    }
                  : {
                      src: "/assets/images/3d/vortex-3d.webp",
                      alt: "Magnetic Vortex Nanodisk with Core Singularity and STT Auto-Oscillation",
                      badgeText: "3D Magnetic Vortex · Core",
                      watermark: "AUTO-OSCILLATOR",
                      glowColor: "rgba(157, 87, 230, 0.55)",
                      secondaryGlowColor: "rgba(87, 230, 221, 0.35)",
                      flyInOffset: 130,
                      parallaxFactor: 0.28,
                    };

            return (
              <div
                key={domain.id}
                id={domain.id}
                className={`${styles.card} ${isFeatured ? styles.cardFeatured : ""}`}
                onPointerMove={handlePointerMove}
                data-testid={`research-card-${domain.id}`}
              >
                <div className={styles.cardGlow} aria-hidden="true" />
                <div className={styles.cardBorder} aria-hidden="true" />

                <div className={isFeatured ? styles.featuredLayout : styles.cardContent}>
                  <div className={styles.modelContainer}>
                    <ParallaxModel3D
                      src={modelConfig.src}
                      alt={modelConfig.alt}
                      badgeText={modelConfig.badgeText}
                      watermark={modelConfig.watermark}
                      glowColor={modelConfig.glowColor}
                      secondaryGlowColor={modelConfig.secondaryGlowColor}
                      flyInOffset={modelConfig.flyInOffset}
                      parallaxFactor={modelConfig.parallaxFactor}
                    />
                  </div>

                  <div className={styles.detailsContainer}>
                    <div className={styles.cardTop}>
                      <span className={styles.cardNumber}>{domain.index}</span>
                      <div className={styles.cardIndicator} aria-hidden="true" />
                    </div>

                    <h3 className={styles.cardTitle}>{domain.title}</h3>
                    <p className={styles.cardDescription}>{domain.description}</p>

                    {domain.equationsOrNotation && domain.equationsOrNotation.length > 0 && (
                      <div className={styles.equationRow}>
                        {domain.equationsOrNotation.map((eq) => (
                          <code key={eq} className={styles.equationBadge}>
                            {eq}
                          </code>
                        ))}
                      </div>
                    )}

                    <div className={styles.cardTags}>
                      {domain.keyConcepts.map((concept) => (
                        <span key={concept} className={styles.tag}>
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.detailAction}>
          <Link href="/research" className={styles.detailLink}>
            {language === "pl"
              ? "Zobacz szczegółowy opis osi badawczych i formalizm teoretyczny →"
              : "Explore detailed research axes and theoretical formalism →"}
          </Link>
        </div>
      </div>
    </section>
  );
}
