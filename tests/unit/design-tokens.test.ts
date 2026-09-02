import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase 2 Visual Design System Tokens", () => {
  const tokensPath = path.resolve(process.cwd(), "src/styles/tokens.css");
  const globalsPath = path.resolve(process.cwd(), "src/styles/globals.css");
  const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");

  it("defines authoritative spatial canvas and ink tokens in tokens.css", () => {
    const tokensContent = fs.readFileSync(tokensPath, "utf-8");

    // Canvas
    expect(tokensContent).toContain("--color-canvas: #030405;");
    expect(tokensContent).toContain("--color-canvas-subtle: #06080c;");
    expect(tokensContent).toContain("--color-canvas-raised: #0b0e14;");
    expect(tokensContent).toContain("--color-canvas-glass:");

    // Ink
    expect(tokensContent).toContain("--color-ink: #f2f0ea;");
    expect(tokensContent).toContain("--color-ink-muted:");
    expect(tokensContent).toContain("--color-ink-faint:");

    // Hairline borders
    expect(tokensContent).toContain("--color-line-subtle:");
    expect(tokensContent).toContain("--color-line-medium:");
    expect(tokensContent).toContain("--color-line-bright:");
  });

  it("defines central editorial scientific accent palette tokens", () => {
    const tokensContent = fs.readFileSync(tokensPath, "utf-8");

    expect(tokensContent).toContain("--accent-primary: #9d84fc;");
    expect(tokensContent).toContain("--accent-indigo: #5672f7;");
    expect(tokensContent).toContain("--accent-purple: #bd68f8;");
    expect(tokensContent).toContain("--accent-violet: #8b6ff9;");
    expect(tokensContent).toContain("--status-active: #9d84fc;");
    expect(tokensContent).toContain("--gradient-accent:");
    expect(tokensContent).toContain("--gradient-text-hero:");
  });

  it("defines calibrated fluid typography scale", () => {
    const tokensContent = fs.readFileSync(tokensPath, "utf-8");

    expect(tokensContent).toContain("--text-display-2xl:");
    expect(tokensContent).toContain("--text-display-xl:");
    expect(tokensContent).toContain("--text-heading-lg:");
    expect(tokensContent).toContain("--text-body-lg:");
    expect(tokensContent).toContain("--text-body-base:");
    expect(tokensContent).toContain("--text-mono-base:");
    expect(tokensContent).toContain("--text-mono-sm:");

    // Fluid clamps
    expect(tokensContent).toContain("clamp(");
  });

  it("defines modular spacing scale and container constraints", () => {
    const tokensContent = fs.readFileSync(tokensPath, "utf-8");

    expect(tokensContent).toContain("--space-1:");
    expect(tokensContent).toContain("--space-4:");
    expect(tokensContent).toContain("--space-8:");
    expect(tokensContent).toContain("--space-16:");
    expect(tokensContent).toContain("--container-max: 1360px;");
    expect(tokensContent).toContain("--container-narrow: 840px;");
  });

  it("imports tokens into globals.css and sets body font-family", () => {
    const globalsContent = fs.readFileSync(globalsPath, "utf-8");

    expect(globalsContent).toContain('@import "./tokens.css" layer(tokens);');
    expect(globalsContent).toContain("var(--font-display");
    expect(globalsContent).toContain("color-scheme: dark;");
  });

  it("configures Plus Jakarta Sans and JetBrains Mono fonts in layout.tsx", () => {
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    expect(layoutContent).toContain("Plus_Jakarta_Sans");
    expect(layoutContent).toContain("JetBrains_Mono");
    expect(layoutContent).toContain('variable: "--font-display"');
    expect(layoutContent).toContain('variable: "--font-mono"');
    expect(layoutContent).toContain('subsets: ["latin", "latin-ext"]');
  });
});
