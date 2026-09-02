import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { Footer } from "../../src/components/footer/Footer";
import { MountainHero } from "../../src/components/hero/MountainHero";
import { Header } from "../../src/components/navigation/Header";
import { ResearchGrid } from "../../src/components/sections/ResearchGrid";

describe("Homepage Shell & Mountain Hero Components", () => {
  it("renders the mountain hero with multi-plane layers and main editorial heading", () => {
    render(<MountainHero />);

    expect(screen.getByRole("region", { name: "Hero Introduction" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /Exploring magnetic textures/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore Research/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Visual Laboratory/i })).toBeInTheDocument();

    expect(screen.getByTestId("parallax-layer-sky")).toBeInTheDocument();
    expect(screen.getByTestId("parallax-layer-midground")).toBeInTheDocument();
    expect(screen.getByTestId("parallax-layer-mist")).toBeInTheDocument();
    expect(screen.getByTestId("parallax-layer-foreground")).toBeInTheDocument();
  });

  it("renders navigation header and research domains", () => {
    render(
      <>
        <Header />
        <ResearchGrid />
        <Footer />
      </>,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Computational Physics/i })).toBeInTheDocument();
    expect(screen.getByTestId("research-card-skyrmions")).toBeInTheDocument();
    expect(screen.getByTestId("research-card-magnonics")).toBeInTheDocument();
    expect(screen.getByTestId("research-card-simulations")).toBeInTheDocument();
    expect(screen.getByTestId("research-card-instrumentation")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
