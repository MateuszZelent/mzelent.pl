"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useSyncExternalStore } from "react";

import { useSceneStore } from "../../visual/state/scene-store";
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

export interface MountainHeroProps {
  readonly snowCanvas?: React.ReactNode;
}

export function MountainHero({ snowCanvas }: MountainHeroProps) {
  const osReducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const motionMode = useSceneStore((state) => state.motionMode);
  const tierOverride = useSceneStore((state) => state.tierOverride);

  const isDev = process.env.NODE_ENV === "development";
  // In development, or when explicit preview override is set, allow previewing
  const allowPreview = (isDev && tierOverride !== null) || motionMode === "full-preview";

  // Strict reduced motion compliance: in production, OS setting is respected unconditionally
  const isReducedMotion = motionMode === "reduced" || (osReducedMotion && !allowPreview);

  const heroRef = useRef<HTMLElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const snowRef = useRef<HTMLDivElement>(null);
  const foreRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isReducedMotion) {
      // Clear any remaining transforms when reduced motion is active
      if (skyRef.current) skyRef.current.style.transform = "";
      if (midRef.current) midRef.current.style.transform = "";
      if (mistRef.current) mistRef.current.style.transform = "";
      if (snowRef.current) snowRef.current.style.transform = "";
      if (foreRef.current) foreRef.current.style.transform = "";
      if (contentRef.current) {
        contentRef.current.style.transform = "";
        contentRef.current.style.opacity = "";
      }
      return;
    }

    let targetScrollY = window.scrollY || 0;
    let currentScrollY = targetScrollY;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleScroll = () => {
      targetScrollY = window.scrollY || 0;
    };

    const handlePointerMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetMouseX = (e.clientX - halfW) / halfW;
      targetMouseY = (e.clientY - halfH) / halfH;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    let rafId: number;
    const updateTransforms = () => {
      // Smooth cinematic interpolation (lerp)
      currentScrollY += (targetScrollY - currentScrollY) * 0.12;
      currentMouseX += (targetMouseX - currentMouseX) * 0.06;
      currentMouseY += (targetMouseY - currentMouseY) * 0.06;

      const scroll = currentScrollY;
      const mx = currentMouseX;
      const my = currentMouseY;

      // 1. Sky layer: Sinks slowly with scroll, subtle counter-mouse shift
      if (skyRef.current) {
        const x = mx * 10;
        const y = scroll * 0.42 + my * 6;
        skyRef.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(1.06)`;
      }

      // 2. Midground Peaks: Sinks moderately, separating from foreground
      if (midRef.current) {
        const x = mx * -14;
        const y = scroll * 0.26 + my * -8;
        midRef.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(1.04)`;
      }

      // 3. Mist layer: Ambient float + scroll drift
      if (mistRef.current) {
        const x = mx * -22;
        const y = scroll * 0.14 + my * -12;
        mistRef.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(1.03)`;
      }

      // 3.5. Snow canvas: Drifts smoothly with the midground volume
      if (snowRef.current) {
        const x = mx * -16;
        const y = scroll * 0.2 + my * -10;
        snowRef.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      }

      // 4. Foreground Rocky Ridge: Moves RAPIDLY UPWARD and ZOOMS forward (NVIDIA 3D push!)
      if (foreRef.current) {
        const x = mx * -38;
        const y = -scroll * 0.38 + my * -22;
        const scale = (1.05 + scroll * 0.00035).toFixed(4);
        foreRef.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale})`;
      }

      // 5. Editorial Content: Lifts up and smoothly fades out
      if (contentRef.current) {
        const x = mx * -18;
        const y = -scroll * 0.45 + my * -12;
        const opacity = Math.max(0, 1 - scroll / 550);
        contentRef.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        contentRef.current.style.opacity = opacity.toFixed(3);
      }

      rafId = requestAnimationFrame(updateTransforms);
    };

    rafId = requestAnimationFrame(updateTransforms);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handlePointerMove);
      cancelAnimationFrame(rafId);
    };
  }, [isReducedMotion]);

  return (
    <section
      ref={heroRef}
      className={`${styles.heroSection} ${isReducedMotion ? styles.reducedMotion : ""}`}
      aria-label="Hero Introduction"
    >
      {/* Layer 1: Atmospheric Sky & Horizon */}
      <div ref={skyRef} className={styles.layerSky} aria-hidden="true" data-testid="parallax-layer-sky">
        <Image
          src="/assets/images/mountains/sky-bg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.layerImage}
        />
      </div>

      {/* Layer 2: GPU Snow Canvas (Falls in the atmosphere BEHIND the mountain peaks!) */}
      {!isReducedMotion && snowCanvas && (
        <div ref={snowRef} className={styles.layerSnow} aria-hidden="true" data-testid="parallax-layer-snow">
          {snowCanvas}
        </div>
      )}

      {/* Layer 3: Midground Alpine Mountain Peaks (Sits in FRONT of the falling snow) */}
      <div
        ref={midRef}
        className={styles.layerMidground}
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

      {/* Layer 4: Rolling Atmospheric Alpine Mist */}
      <div ref={mistRef} className={styles.layerMist} aria-hidden="true" data-testid="parallax-layer-mist">
        <Image
          src="/assets/images/mountains/mist-clouds.webp"
          alt=""
          fill
          sizes="100vw"
          className={`${styles.layerImage} ${styles.animatedMist}`}
        />
      </div>

      {/* Layer 4: Foreground Rocky Ridge & Crags (Opaque rocks sit in FRONT of falling snow) */}
      <div
        ref={foreRef}
        className={styles.layerForeground}
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
      <div ref={contentRef} className={styles.contentContainer}>
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
