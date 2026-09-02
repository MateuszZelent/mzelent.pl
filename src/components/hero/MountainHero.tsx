"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";

import styles from "./MountainHero.module.css";

function readReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeReducedMotion(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionQuery.addEventListener?.("change", onStoreChange);
  return () => motionQuery.removeEventListener?.("change", onStoreChange);
}

export function MountainHero() {
  const [scrollY, setScrollY] = useState(0);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY || window.pageYOffset || 0);
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Compute multi-plane 2.5D parallax transforms
  const isParallaxActive = !reducedMotion;
  const skyY = isParallaxActive ? scrollY * 0.08 : 0;
  const midY = isParallaxActive ? scrollY * 0.22 : 0;
  const mistY = isParallaxActive ? scrollY * 0.36 : 0;
  const foreY = isParallaxActive ? scrollY * 0.68 : 0;
  const contentY = isParallaxActive ? scrollY * 0.38 : 0;
  const contentOpacity = isParallaxActive ? Math.max(0, 1 - scrollY / 650) : 1;

  return (
    <section ref={heroRef} className={styles.heroSection} aria-label="Hero Introduction">
      {/* Layer 1: Atmospheric Sky & Horizon */}
      <div
        className={styles.layerSky}
        style={{ transform: `translate3d(0, ${skyY}px, 0)` }}
        aria-hidden="true"
        data-testid="parallax-layer-sky"
      >
        <Image
          src="/assets/images/mountains/sky-bg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.layerImage}
        />
      </div>

      {/* Layer 2: Midground Alpine Mountain Peaks */}
      <div
        className={styles.layerMidground}
        style={{ transform: `translate3d(0, ${midY}px, 0)` }}
        aria-hidden="true"
        data-testid="parallax-layer-midground"
      >
        <Image
          src="/assets/images/mountains/midground-peaks.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.layerImage}
        />
      </div>

      {/* Layer 3: Rolling Atmospheric Alpine Mist */}
      <div
        className={styles.layerMist}
        style={{ transform: `translate3d(0, ${mistY}px, 0)` }}
        aria-hidden="true"
        data-testid="parallax-layer-mist"
      >
        <Image
          src="/assets/images/mountains/mist-clouds.webp"
          alt=""
          fill
          sizes="100vw"
          className={`${styles.layerImage} ${styles.animatedMist}`}
        />
      </div>

      {/* Layer 4: Foreground Rocky Ridge & Crags */}
      <div
        className={styles.layerForeground}
        style={{ transform: `translate3d(0, ${foreY}px, 0)` }}
        aria-hidden="true"
        data-testid="parallax-layer-foreground"
      >
        <Image
          src="/assets/images/mountains/foreground-ridge.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.layerImage}
        />
      </div>

      {/* Bottom Vignette & Seamless Transition Gradient */}
      <div className={styles.bottomVignette} aria-hidden="true" />

      {/* Layer 5: Editorial Content & Typography */}
      <div
        className={styles.contentContainer}
        style={{
          transform: `translate3d(0, ${contentY}px, 0)`,
          opacity: contentOpacity,
        }}
      >
        <div className={styles.heroBadge}>
          <span className={styles.badgePulse} aria-hidden="true" />
          <span>Scientific Portfolio & Visual Laboratory</span>
        </div>

        <h1 className={styles.heroTitle}>
          Exploring magnetic textures <br />
          <span className={styles.heroTitleAccent}>& nonlinear wave dynamics.</span>
        </h1>

        <p className={styles.heroLead}>
          Theoretical and computational research across chiral skyrmions, spin waves, nanomagnetic vector
          fields, and high-performance physics simulations.
        </p>

        <div className={styles.heroActions}>
          <a href="#research" className={styles.primaryButton}>
            Explore Research
            <svg
              className={styles.buttonIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>

          <Link href="/lab/visual-system?tier=medium" className={styles.secondaryButton}>
            Visual Laboratory
          </Link>
        </div>

        <div className={styles.metricRow}>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>01</span>
            <span className={styles.metricLabel}>Topological Solitons</span>
          </div>
          <div className={styles.metricDivider} aria-hidden="true" />
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>02</span>
            <span className={styles.metricLabel}>Spin-Wave Optics</span>
          </div>
          <div className={styles.metricDivider} aria-hidden="true" />
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>03</span>
            <span className={styles.metricLabel}>GPU Vector Fields</span>
          </div>
        </div>
      </div>
    </section>
  );
}
