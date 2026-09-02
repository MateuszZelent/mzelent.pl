"use client";

import Image from "next/image";
import React, { useEffect, useRef, useSyncExternalStore } from "react";

import styles from "./ParallaxModel3D.module.css";

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

export interface ParallaxModel3DProps {
  readonly src: string;
  readonly alt: string;
  readonly badgeText: string;
  readonly watermark?: string;
  readonly glowColor?: string;
  readonly secondaryGlowColor?: string;
  readonly flyInOffset?: number;
  readonly parallaxFactor?: number;
  readonly className?: string;
}

export function ParallaxModel3D({
  src,
  alt,
  badgeText,
  watermark = "NVIDIA 3D CRAFT",
  glowColor = "rgba(87, 230, 221, 0.45)",
  secondaryGlowColor = "rgba(132, 108, 255, 0.25)",
  flyInOffset = 60,
  parallaxFactor = 0.18,
  className = "",
}: ParallaxModel3DProps) {
  const isReducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isReducedMotion) {
      if (stageRef.current) stageRef.current.style.transform = "";
      if (imageRef.current) imageRef.current.style.transform = "";
      return;
    }

    let targetParallaxY = 0;
    let currentParallaxY = 0;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let targetRotateZ = 0;
    let currentRotateZ = 0;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;

      // Calculate progress of container through viewport (-1 when above, 0 at center, +1 when below)
      const centerOffset = Math.max(
        -1.5,
        Math.min(1.5, (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight),
      );

      // As user scrolls down from the mountains, centerOffset is positive (element entering from below).
      // Negative translation places it high up toward the mountain mist, smoothly gliding down into place!
      targetParallaxY = -centerOffset * flyInOffset * 0.8;
      targetRotateZ = centerOffset * 4.5;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Only compute tilt when mouse is in or near container
      if (
        e.clientX < rect.left - 100 ||
        e.clientX > rect.right + 100 ||
        e.clientY < rect.top - 100 ||
        e.clientY > rect.bottom + 100
      ) {
        targetRotateX = 0;
        targetRotateY = 0;
        return;
      }

      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

      // Max 10 deg interactive 3D perspective tilt
      targetRotateX = -y * 8;
      targetRotateY = x * 8;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    handleScroll();

    let rafId: number;
    const loop = () => {
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.12;
      currentRotateX += (targetRotateX - currentRotateX) * 0.08;
      currentRotateY += (targetRotateY - currentRotateY) * 0.08;
      currentRotateZ += (targetRotateZ - currentRotateZ) * 0.08;

      if (stageRef.current) {
        stageRef.current.style.transform = `translate3d(0, ${currentParallaxY.toFixed(2)}px, 0) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) rotateZ(${currentRotateZ.toFixed(2)}deg)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isReducedMotion, flyInOffset, parallaxFactor]);

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`} data-testid="parallax-model-3d">
      {/* Ambient localized neon glow */}
      <div
        className={styles.ambientBacklight}
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, ${secondaryGlowColor} 50%, transparent 80%)`,
        }}
        aria-hidden="true"
      />

      {/* 3D Motion Stage */}
      <div ref={stageRef} className={styles.modelStage}>
        <div ref={imageRef} className={styles.modelImageWrapper}>
          <Image src={src} alt={alt} width={640} height={640} unoptimized className={styles.modelImage} />
        </div>
      </div>

      {/* Badge & Watermark */}
      <div className={styles.badgeOverlay}>
        <span className={styles.pulseDot} aria-hidden="true" />
        <span>{badgeText}</span>
      </div>

      {watermark && <div className={styles.techWatermark}>{watermark}</div>}
    </div>
  );
}
