"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import styles from "./Header.module.css";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand} aria-label="Mateusz Zelent Homepage">
          <span className={styles.brandMark}>MZ</span>
          <span className={styles.brandText}>mzelent.pl</span>
        </Link>

        <nav className={styles.nav} aria-label="Main Navigation">
          <ul className={styles.navList}>
            <li>
              <a href="#research" className={styles.navLink}>
                Research
              </a>
            </li>
            <li>
              <a href="#software" className={styles.navLink}>
                Software
              </a>
            </li>
            <li>
              <a href="#publications" className={styles.navLink}>
                Publications
              </a>
            </li>
            <li>
              <Link href="/lab/visual-system?tier=medium" className={styles.navLink}>
                Visual Lab
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.headerRight}>
          <div className={styles.statusIndicator} title="Status: Active Research & Development">
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>Active Research</span>
          </div>

          <Link href="/lab/visual-system?tier=medium" className={styles.labButton}>
            Lab Sandbox
          </Link>
        </div>
      </div>
    </header>
  );
}
