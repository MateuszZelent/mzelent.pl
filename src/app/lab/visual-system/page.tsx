import styles from "./visual-system.module.css";
import { VisualStageClient } from "./visual-stage.client";

const sectionLinks = [
  { href: "#ambient-field", label: "Ambient field" },
  { href: "#surface-response", label: "Surface response" },
  { href: "#scroll-interval", label: "Scroll interval" },
];

export default function VisualSystemPage() {
  return (
    <main className={styles.page} id="visual-system-content">
      <a className={styles.skipLink} href="#laboratory-shell">
        Skip to laboratory shell
      </a>

      <header className={styles.shellHeader}>
        <a className={styles.wordmark} href="#laboratory-shell" aria-label="Visual system laboratory home">
          <span className={styles.wordmarkMark} aria-hidden="true" />
          <span>mzelent.pl</span>
        </a>

        <p className={styles.headerStatus}>
          <span className={styles.statusDot} aria-hidden="true" />
          Phase 1 / shell calibration
        </p>

        <nav aria-label="Laboratory sections">
          <ul className={styles.navList}>
            {sectionLinks.map((section) => (
              <li key={section.href}>
                <a href={section.href}>{section.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <section className={styles.hero} id="laboratory-shell" tabIndex={-1} aria-labelledby="laboratory-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>01 — visual technology spike</p>
          <h1 id="laboratory-title">Visual System Laboratory</h1>
          <p className={styles.heroLead}>
            A quiet test surface for a future scientific visual language. The semantic shell and its static
            fallback are usable before any enhanced rendering layer is available.
          </p>
          <ul className={styles.heroMeta} aria-label="Current shell capabilities">
            <li>Semantic DOM</li>
            <li>Static fallback</li>
            <li>WebGL2 single runtime</li>
          </ul>
        </div>

        <div className={styles.sceneFrame} data-testid="scene-frame">
          <VisualStageClient />
          <div className={styles.sceneFooter}>
            <span>Visual runtime</span>
            <span>Calibration scene — demand loop</span>
          </div>
        </div>

        <p className={styles.fallbackNote} data-testid="fallback-note">
          The static poster is the complete fallback while the enhanced visual layer is unavailable.
        </p>
        <noscript>
          <p className={styles.noScriptNote}>
            JavaScript is disabled. The semantic shell and static poster remain available.
          </p>
        </noscript>
      </section>

      <div className={styles.sectionRail} aria-hidden="true">
        <span>System / 01</span>
        <span>Scroll to inspect the shell intervals</span>
      </div>

      <section className={styles.labSection} id="ambient-field" aria-labelledby="ambient-field-title">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>02 — calibration plane</p>
          <h2 id="ambient-field-title">Ambient field</h2>
          <p>
            A reserved interval for the future atmosphere. At this stage it remains a stable, readable plane
            with no simulated particles or client-side motion.
          </p>
        </div>
        <dl className={styles.measureList}>
          <div>
            <dt>State</dt>
            <dd>Single canvas runtime</dd>
          </div>
          <div>
            <dt>Canvas</dt>
            <dd>WebGL2 / Demand</dd>
          </div>
          <div>
            <dt>Input</dt>
            <dd>Native scroll</dd>
          </div>
        </dl>
      </section>

      <section className={styles.labSection} id="surface-response" aria-labelledby="surface-response-title">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>03 — response plane</p>
          <h2 id="surface-response-title">Surface response</h2>
          <p>
            A semantic surface for later local illumination tests. Its contrast, border, and focus states are
            authored in CSS and remain legible without enhancement.
          </p>
        </div>
        <div className={styles.surfaceSample} data-testid="surface-sample">
          <span className={styles.surfaceLine} aria-hidden="true" />
          <p className={styles.surfaceLabel}>Local light / not yet connected</p>
          <p className={styles.surfaceValue}>—</p>
        </div>
      </section>

      <section className={styles.labSection} id="scroll-interval" aria-labelledby="scroll-interval-title">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>04 — interval test</p>
          <h2 id="scroll-interval-title">Scroll interval</h2>
          <p>
            This measured section provides enough document height for later reversible scene-transition tests.
            No scroll owner or timeline library is installed in the scaffold.
          </p>
        </div>
        <div className={styles.intervalMarker} aria-hidden="true">
          <span>Start</span>
          <span className={styles.intervalTrack} />
          <span>End</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Phase 1 / Visual Technology Spike</p>
        <a href="#laboratory-shell">Return to shell</a>
      </footer>
    </main>
  );
}
