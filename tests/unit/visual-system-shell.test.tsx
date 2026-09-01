import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import VisualSystemPage from "../../src/app/lab/visual-system/page";

describe("Visual System Laboratory shell", () => {
  it("keeps the shell semantic and the static fallback visible", () => {
    render(<VisualSystemPage />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    expect(screen.getByTestId("static-poster")).toBeVisible();
    expect(screen.getByTestId("canvas-slot")).toHaveAttribute("data-canvas-slot", "reserved");
    expect(screen.getByTestId("fallback-note")).toHaveTextContent("complete fallback");
    expect(screen.queryByRole("img", { name: /portfolio/i })).not.toBeInTheDocument();
  });

  it("does not introduce the WebGL runtime in the scaffold", () => {
    render(<VisualSystemPage />);

    expect(document.querySelector("canvas")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Laboratory sections" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to shell" })).toHaveAttribute("href", "#laboratory-shell");
  });
});
