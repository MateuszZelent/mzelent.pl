import type { Metadata } from "next";
import React from "react";

import { profile, publications } from "../content";
import { generatePersonJsonLd, generateScholarlyArticleJsonLd } from "../content/seo/json-ld";
import { Footer } from "../components/footer/Footer";
import { MountainHero } from "../components/hero/MountainHero";
import { Header } from "../components/navigation/Header";
import { AffiliationsStrip } from "../components/sections/AffiliationsStrip";
import { GrantsSection } from "../components/sections/GrantsSection";
import { ResearchGrid } from "../components/sections/ResearchGrid";
import { SelectedPublications } from "../components/sections/SelectedPublications";
import { SoftwareShowcase } from "../components/sections/SoftwareShowcase";
import { HomeDiagnostics, HomeSnowCanvas } from "./home-stage.client";

export const metadata: Metadata = {
  title: "Mateusz Zelent — Computational Physics & Magnetic Dynamics",
  description:
    "Scientific portfolio and research on chiral skyrmions, topological solitons, nonlinear spin waves, and GPU-accelerated numerical simulations.",
};

export default function HomePage() {
  const personJsonLd = generatePersonJsonLd(profile);
  const featuredArticleLd = publications[0] ? generateScholarlyArticleJsonLd(publications[0]) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      {featuredArticleLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredArticleLd) }}
        />
      )}

      <Header />

      <main id="main-content" tabIndex={-1}>
        <MountainHero snowCanvas={<HomeSnowCanvas />} />
        <ResearchGrid />
        <GrantsSection />
        <SoftwareShowcase />
        <SelectedPublications />
        <AffiliationsStrip />
      </main>

      <Footer />

      <HomeDiagnostics />
    </>
  );
}
