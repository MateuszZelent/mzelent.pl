"use client";

import Image from "next/image";
import React from "react";

import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./AffiliationsStrip.module.css";

interface PartnerLogo {
  readonly id: string;
  readonly name: string;
  readonly src: string;
  readonly href: string;
  readonly width: number;
  readonly height: number;
}

const PARTNER_LOGOS: readonly PartnerLogo[] = [
  {
    id: "rptu",
    name: "RPTU Kaiserslautern-Landau",
    src: "/assets/logos/rptu.svg",
    href: "https://rptu.de",
    width: 280,
    height: 80,
  },
  {
    id: "uam",
    name: "Uniwersytet im. Adama Mickiewicza w Poznaniu",
    src: "/assets/logos/uam.svg",
    href: "https://amu.edu.pl",
    width: 280,
    height: 80,
  },
  {
    id: "eu-msca",
    name: "European Union — Marie Skłodowska-Curie Actions (CNMA)",
    src: "/assets/logos/eu-msca.svg",
    href: "https://marie-sklodowska-curie-actions.ec.europa.eu/",
    width: 320,
    height: 80,
  },
  {
    id: "ncn",
    name: "Narodowe Centrum Nauki (NCN)",
    src: "/assets/logos/ncn.svg",
    href: "https://www.ncn.gov.pl",
    width: 280,
    height: 80,
  },
];

export function AffiliationsStrip() {
  const { t } = useTranslation();

  return (
    <section className={styles.section} aria-label={t.affiliations.title}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.affiliations.title}</h2>
          <p className={styles.subtitle}>{t.affiliations.subtitle}</p>
        </div>

        <div className={styles.logoGrid}>
          {PARTNER_LOGOS.map((partner) => (
            <a
              key={partner.id}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.logoCard}
              data-testid={`affiliation-logo-${partner.id}`}
              aria-label={`Official website of ${partner.name}`}
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                className={styles.logoImage}
              />
            </a>
          ))}
        </div>

        <div className={styles.fundingNotes}>
          <div className={styles.noteItem}>
            <span className={styles.noteBadge}>[EU / MSCA]:</span>
            <span>{t.affiliations.mscaNote}</span>
          </div>

          <div className={styles.noteItem}>
            <span className={styles.noteBadge}>[NCN / Poland]:</span>
            <span>{t.affiliations.ncnNote}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
