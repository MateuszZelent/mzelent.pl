import { describe, expect, it } from "vitest";

import { blogPosts } from "../../src/content";
import { BlogPostSchema } from "../../src/content/schemas/blog.schema";

describe("Blog Data & Schema Validation", () => {
  it("validates that all exported blog posts pass BlogPostSchema parsing", () => {
    expect(blogPosts.length).toBeGreaterThanOrEqual(4);

    for (const post of blogPosts) {
      const parsed = BlogPostSchema.safeParse(post);
      expect(parsed.success).toBe(true);
      expect(post.title.length).toBeGreaterThan(5);
      expect(post.description.length).toBeGreaterThan(20);
      expect(post.imageUrl).toMatch(/^\/(images|uploads)\/blog\/.*\.(webp|jpg|png)$/);
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.tags.length).toBeGreaterThan(0);
    }
  });

  it("contains Dr. Zelent's authentic research domains: Skyrmions, RPTU lab, and Curvilinear nanomembranes", () => {
    const skyrmionPost = blogPosts.find((p) => p.id === "skyrmion-lattice-dynamics");
    expect(skyrmionPost).toBeDefined();
    expect(skyrmionPost?.category).toBe("Simulation");
    expect(skyrmionPost?.technicalDetails?.simulationEngine).toContain("MuMax3");

    const rptuLab = blogPosts.find((p) => p.id === "rptu-brillouin-optics-setup");
    expect(rptuLab).toBeDefined();
    expect(rptuLab?.location).toContain("RPTU");
    expect(rptuLab?.tags).toContain("MSCA CNMA");

    const curvedMembrane = blogPosts.find((p) => p.id === "curvilinear-nanomembrane-microscopy");
    expect(curvedMembrane).toBeDefined();
    expect(curvedMembrane?.category).toBe("Equipment");
  });

  it("filters and searches blog entries accurately across categories and query terms", () => {
    // Category filter: Laboratory
    const labPosts = blogPosts.filter((p) => p.category === "Laboratory");
    expect(labPosts.length).toBeGreaterThanOrEqual(2);
    expect(labPosts.every((p) => p.category === "Laboratory")).toBe(true);

    // Fulltext search by apparatus: "MuMax3"
    const mumaxMatches = blogPosts.filter(
      (p) =>
        p.title.toLowerCase().includes("mumax") ||
        p.technicalDetails?.simulationEngine?.toLowerCase().includes("mumax"),
    );
    expect(mumaxMatches.length).toBeGreaterThanOrEqual(1);
    expect(mumaxMatches[0].id).toBe("skyrmion-lattice-dynamics");

    // Fulltext search by tag: "MSCA CNMA"
    const mscaMatches = blogPosts.filter((p) => p.tags.some((t) => t.toLowerCase().includes("msca cnma")));
    expect(mscaMatches.length).toBeGreaterThanOrEqual(1);

    // Fulltext search by location: "Kaiserslautern"
    const kaiserslauternMatches = blogPosts.filter((p) =>
      p.location.toLowerCase().includes("kaiserslautern"),
    );
    expect(kaiserslauternMatches.length).toBeGreaterThanOrEqual(2);
  });
});
