"use client";

import Link from "next/link";
import React from "react";

import { HomeSpintronicsCanvas } from "../../app/home-stage.client";
import { SpintronicsControls } from "../../app/lab/visual-system/SpintronicsControls";
import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./SpintronicsSection.module.css";

export function SpintronicsSection() {
  const { t } = useTranslation();

  return (
    <section
      id="simulation"
      className={styles.section}
      aria-labelledby="spintronics-section-title"
      data-testid="spintronics-section"
    >
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.tag}>{t.spintronicsSection.tag}</p>
            <h2 id="spintronics-section-title" className={styles.title}>
              {t.spintronicsSection.title}{" "}
              <span className={styles.titleAccent}>{t.spintronicsSection.titleAccent}</span>
            </h2>
            <p className={styles.lead}>{t.spintronicsSection.lead}</p>
          </div>

          <div className={styles.headerAction}>
            <Link
              href="/lab/visual-system?scene=spintronics"
              className={styles.labButton}
              aria-label="Open full spintronics research laboratory"
            >
              <span>{t.spintronicsSection.openLabLink}</span>
              <span className={styles.labButtonIcon} aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>
        </div>

        {/* Cinematic Stage: Left Parameters Workbench, Right 3D Visualizer */}
        <div className={styles.cinematicStage} data-testid="spintronics-stage-frame">
          {/* Left Column: Physical Parameters & Controls */}
          <div className={styles.workbenchColumn}>
            <div className={styles.workbenchHeader}>
              <span className={styles.workbenchTag}>PHYSICS WORKBENCH</span>
              <h3 className={styles.workbenchHeading}>Sterowanie Mikromagnetyczne</h3>
            </div>
            <SpintronicsControls className={styles.customControls} />
          </div>

          {/* Right Column: Interactive 3D WebGL Visualization */}
          <div className={styles.stageFrame}>
            <div className={styles.canvasWrapper}>
              <HomeSpintronicsCanvas />
            </div>

            {/* Seamless Gradient Blends bridging Left and Right */}
            <div className={styles.blendLeft} aria-hidden="true" />
            <div className={styles.blendBottom} aria-hidden="true" />
            <div className={styles.radialGlow} aria-hidden="true" />

            <div className={styles.stageOverlay}>
              <div className={styles.statusBadge}>
                <span className={styles.pulseDot} aria-hidden="true" />
                <span>3D WebGL2 GPU Engine</span>
              </div>
              <div className={styles.interactionHint}>
                <span>✦ Drag to rotate in 3D · Scroll to zoom</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
