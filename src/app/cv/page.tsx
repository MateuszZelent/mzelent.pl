"use client";

import Link from "next/link";
import React from "react";

import { Footer } from "../../components/footer/Footer";
import { Header } from "../../components/navigation/Header";
import { grantsData } from "../../content/data/grants";
import { profileData } from "../../content/data/profile";
import { talksData } from "../../content/data/talks";
import { useTranslation } from "../../content/i18n/i18n-context";
import styles from "./cv.module.css";

export default function CvPage() {
  const { t, language } = useTranslation();

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const appointments = [
    {
      period: "2024 — 2026",
      role:
        language === "pl"
          ? "Stypendysta Marie Skłodowska-Curie (MSCA Fellow)"
          : "Marie Skłodowska-Curie Postdoctoral Fellow",
      org: "RPTU Kaiserslautern-Landau · Fachbereich Physik & OPTIMAS (Germany)",
      desc:
        language === "pl"
          ? "Kierownik projektu 'CNMA' (Horyzont Europa nr 101108257). Badania nieliniowych auto-oscylacji magnonicznych dla neuromorficznych obliczeń rezerwuarowych we współpracy z grupą prof. Philippa Pirro."
          : "Principal Investigator of 'CNMA' project (Horizon Europe No. 101108257). Research on non-stationary spin-torque auto-oscillations for bio-inspired neuromorphic computing hosted by Prof. Philipp Pirro.",
    },
    {
      period: "2020 — present",
      role: language === "pl" ? "Adiunkt (Assistant Professor)" : "Assistant Professor",
      org: "Adam Mickiewicz University in Poznań · Institute of Spintronics and Quantum Information (Poland)",
      desc:
        language === "pl"
          ? "Badania teoretyczne i symulacje mikromagnetyczne topologicznych tekstur magnetycznych, chiralnych skyrmionów oraz optyki fal spinowych w ośrodkach o przestrzennie zmiennych parametrach magnetycznych."
          : "Theoretical research and GPU micromagnetic modeling of topological magnetic solitons, chiral skyrmions, and spin-wave propagation across graded refractive landscapes.",
    },
    {
      period: "2018 — 2020",
      role: language === "pl" ? "Postdoktorant (Postdoctoral Researcher)" : "Postdoctoral Researcher",
      org: "Adam Mickiewicz University in Poznań · Faculty of Physics (Poland)",
      desc:
        language === "pl"
          ? "Modelowanie zjawisk magnonicznych w kryształach magnonicznych i strukturach periodycznych."
          : "Computational modeling of spin-wave dispersion and wavepacket dynamics in magnonic crystals and periodic nanostructures.",
    },
  ];

  const education = [
    {
      period: "2014 — 2018",
      degree:
        language === "pl"
          ? "Doktor nauk fizycznych (z wyróżnieniem)"
          : "PhD in Physical Sciences (with Distinction)",
      org: "Adam Mickiewicz University in Poznań · Faculty of Physics",
      desc:
        language === "pl"
          ? "Rozprawa doktorska poświęcona dynamice fal spinowych i zjawiskom falowym w magnonice nanoskali."
          : "Doctoral dissertation on spin-wave dynamics, dispersion engineering, and wave phenomena in nanoscale magnonics.",
    },
    {
      period: "2012 — 2014",
      degree: language === "pl" ? "Magister fizyki" : "MSc in Physics",
      org: "Adam Mickiewicz University in Poznań",
      desc: language === "pl" ? "Specjalność: Fizyka komputerowa." : "Specialization: Computational Physics.",
    },
    {
      period: "2009 — 2012",
      degree: language === "pl" ? "Licencjat z fizyki" : "BSc in Physics",
      org: "Adam Mickiewicz University in Poznań",
      desc:
        language === "pl"
          ? "Podstawy fizyki teoretycznej i modelowania numerycznego."
          : "Foundations of theoretical physics and numerical simulations.",
    },
  ];

  const skills = [
    "Mumax3 GPU Micromagnetics",
    "Boris Computational Solvers",
    "AOMP Modeling Suite",
    "C++ / CUDA Acceleration",
    "Python (NumPy, SciPy, CuPy)",
    "HPC Slurm Clusters",
    "Topological Soliton Theory",
    "Curvilinear Nanomagnetism",
    "Spin-Wave Optics & Caustics",
    "Finite Element / Finite Difference",
  ];

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <Link href="/" className={styles.backLink}>
          ← {t.publicationsPage.backToHome}
        </Link>

        <header className={styles.headerArea}>
          <div className={styles.topRow}>
            <span className={styles.badge}>{t.cvPage.badge}</span>
            <button
              type="button"
              onClick={handlePrint}
              className={styles.printBtn}
              data-testid="print-cv-btn"
            >
              <span aria-hidden="true" style={{ marginRight: "0.4rem" }}>
                ⎙
              </span>
              {t.cvPage.printCv}
            </button>
          </div>

          <h1 className={styles.title}>
            {t.cvPage.heading} <br />
            <span className={styles.titleAccent}>{t.cvPage.headingAccent}</span>
          </h1>
          <p className={styles.lead}>{t.cvPage.lead}</p>
        </header>

        <div className={styles.layoutGrid}>
          {/* Main Column */}
          <div className={styles.mainColumn}>
            {/* Appointments */}
            <section className={styles.sectionBlock} aria-label="Academic Appointments">
              <h2 className={styles.sectionTitle}>{t.cvPage.appointmentsTitle}</h2>
              <div className={styles.timeline}>
                {appointments.map((item, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineDot} aria-hidden="true" />
                    <div className={styles.timelinePeriod}>{item.period}</div>
                    <h3 className={styles.timelineRole}>{item.role}</h3>
                    <div className={styles.timelineOrg}>{item.org}</div>
                    <p className={styles.timelineDesc}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className={styles.sectionBlock} aria-label="Education">
              <h2 className={styles.sectionTitle}>{t.cvPage.educationTitle}</h2>
              <div className={styles.timeline}>
                {education.map((item, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineDot} aria-hidden="true" />
                    <div className={styles.timelinePeriod}>{item.period}</div>
                    <h3 className={styles.timelineRole}>{item.degree}</h3>
                    <div className={styles.timelineOrg}>{item.org}</div>
                    <p className={styles.timelineDesc}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Grants & Projects */}
            <section className={styles.sectionBlock} aria-label="Research Grants">
              <h2 className={styles.sectionTitle}>{t.cvPage.grantsTitle}</h2>
              <div className={styles.cardList}>
                {grantsData.map((g) => (
                  <div key={g.id} className={styles.grantCard}>
                    <div className={styles.grantHead}>
                      <span className={styles.grantAcronym}>{g.acronym || g.id}</span>
                      <span className={styles.grantBudget}>{g.budget}</span>
                    </div>
                    <h3 className={styles.grantName}>{g.title}</h3>
                    <div className={styles.grantMeta}>
                      {g.funder} · {g.startYear}–{g.endYear} · {g.grantNumber} · {g.role}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Talks */}
            <section className={styles.sectionBlock} aria-label="Invited Talks">
              <h2 className={styles.sectionTitle}>{t.cvPage.talksTitle}</h2>
              <div className={styles.cardList}>
                {talksData.map((tk) => (
                  <div key={tk.id} className={styles.grantCard}>
                    <div className={styles.grantHead}>
                      <span className={styles.grantAcronym}>{tk.type}</span>
                      <span className={styles.grantBudget}>{tk.date}</span>
                    </div>
                    <h3 className={styles.grantName}>{tk.title}</h3>
                    <div className={styles.grantMeta}>
                      {tk.event} · {tk.location}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <aside className={styles.sidebarColumn}>
            {/* Skills & Methods */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>{t.cvPage.skillsTitle}</h3>
              <div className={styles.pillGrid}>
                {skills.map((sk) => (
                  <span key={sk} className={styles.skillPill}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact & Identifiers */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>{t.cvPage.contactTitle}</h3>
              <div className={styles.contactList}>
                <div className={styles.contactItem}>
                  <span>ORCID:</span>
                  <a
                    href={`https://orcid.org/${profileData.identifiers.orcid}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={styles.contactLink}
                  >
                    {profileData.identifiers.orcid} ↗
                  </a>
                </div>

                <div className={styles.contactItem}>
                  <span>Scholar:</span>
                  <a
                    href={profileData.identifiers.googleScholar}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={styles.contactLink}
                  >
                    Google Scholar ↗
                  </a>
                </div>

                <div className={styles.contactItem}>
                  <span>GitHub:</span>
                  <a
                    href={profileData.identifiers.github}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={styles.contactLink}
                  >
                    @MateuszZelent ↗
                  </a>
                </div>

                <div className={styles.contactItem}>
                  <span>Email:</span>
                  <span style={{ color: "var(--color-ink)" }}>mateusz.zelent@amu.edu.pl</span>
                </div>

                <div className={styles.contactItem}>
                  <span>Office:</span>
                  <span>{profileData.contact.office}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
