"use client";

import Link from "next/link";
import React from "react";

import styles from "./Footer.module.css";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.brandCol}>
            <span className={styles.brandTitle}>MATEUSZ ZELENT</span>
            <p className={styles.brandDesc}>
              Computational Physics · Micromagnetics · Nonlinear Spin-Wave Dynamics · High-Performance
              Simulation Engineering.
            </p>
          </div>

          <div className={styles.linksCol}>
            <span className={styles.colTitle}>Navigation</span>
            <ul className={styles.linkList}>
              <li>
                <a href="#research" className={styles.footerLink}>
                  Research Domains
                </a>
              </li>
              <li>
                <Link href="/lab/visual-system?tier=medium" className={styles.footerLink}>
                  Visual Laboratory
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <span className={styles.colTitle}>Technology & Stack</span>
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
            </ul>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Mateusz Zelent. All rights reserved. Built with documentation-first
            precision.
          </p>

          <button type="button" onClick={scrollToTop} className={styles.backToTop} aria-label="Back to top">
            <span>Back to top</span>
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
