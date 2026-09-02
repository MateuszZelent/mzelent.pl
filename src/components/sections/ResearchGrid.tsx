"use client";

import React, { useRef } from "react";

import styles from "./ResearchGrid.module.css";

interface ResearchCard {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
}

const RESEARCH_DOMAINS: readonly ResearchCard[] = [
  {
    id: "skyrmions",
    number: "01",
    title: "Chiral Skyrmions & Solitons",
    description:
      "Topologically protected nanoscale spin textures, Dzyaloshinskii-Moriya exchange interactions, skyrmion-defect pinning mechanisms, and low-current racetrack memory dynamics.",
    tags: ["Micromagnetics", "Topology", "Soliton Physics"],
  },
  {
    id: "magnonics",
    number: "02",
    title: "Spin-Wave Optics & Magnonics",
    description:
      "Nonlinear spin-wave dispersion in microstructured conduits, caustic beam steering, phase interferometry, and magnonic crystal band-gap engineering for wave-based computing.",
    tags: ["Wave Dynamics", "Magnonics", "Phase Control"],
  },
  {
    id: "simulations",
    number: "03",
    title: "High-Performance GPU Simulations",
    description:
      "Accelerated numerical integration of the Landau-Lifshitz-Gilbert (LLG) equation, finite-element mesh refinement, and real-time WebGL vector field renderers.",
    tags: ["GPU Compute", "FBO Simulation", "CUDA & GLSL"],
  },
  {
    id: "instrumentation",
    number: "04",
    title: "Laboratory Measurement Automation",
    description:
      "Micro-focused Brillouin Light Scattering (BLS) spectroscopy, Time-Resolved Magneto-Optical Kerr Effect (TR-MOKE), and automated microwave probe integration.",
    tags: ["BLS Spectroscopy", "TR-MOKE", "Experiment Automation"],
  },
];

export function ResearchGrid() {
  const containerRef = useRef<HTMLElement>(null);

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
            <span>02 / Research Domains</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Computational Physics <br />
            <span className={styles.sectionTitleAccent}>& Magnetic Nanostructures</span>
          </h2>
          <p className={styles.sectionLead}>
            Bridging fundamental analytical magnetics with massive numerical simulations and GPU-accelerated
            wave modeling.
          </p>
        </div>

        <div className={styles.grid}>
          {RESEARCH_DOMAINS.map((domain) => (
            <div
              key={domain.id}
              id={domain.id}
              className={styles.card}
              onPointerMove={handlePointerMove}
              data-testid={`research-card-${domain.id}`}
            >
              <div className={styles.cardGlow} aria-hidden="true" />
              <div className={styles.cardBorder} aria-hidden="true" />
              <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                  <span className={styles.cardNumber}>{domain.number}</span>
                  <div className={styles.cardIndicator} aria-hidden="true" />
                </div>

                <h3 className={styles.cardTitle}>{domain.title}</h3>
                <p className={styles.cardDescription}>{domain.description}</p>

                <div className={styles.cardTags}>
                  {domain.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
