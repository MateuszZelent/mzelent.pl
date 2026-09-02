import type { Metadata } from "next";
import React from "react";

import { Footer } from "../components/footer/Footer";
import { MountainHero } from "../components/hero/MountainHero";
import { Header } from "../components/navigation/Header";
import { ResearchGrid } from "../components/sections/ResearchGrid";
import { HomeVisualStage } from "./home-stage.client";

export const metadata: Metadata = {
  title: "Mateusz Zelent — Computational Physics & Magnetic Dynamics",
  description:
    "Scientific portfolio and research on chiral skyrmions, topological solitons, nonlinear spin waves, and GPU-accelerated numerical simulations.",
};

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header />

      <main id="main-content" tabIndex={-1}>
        <MountainHero snowCanvas={<HomeVisualStage />} />
        <ResearchGrid />
      </main>

      <Footer />
    </>
  );
}
