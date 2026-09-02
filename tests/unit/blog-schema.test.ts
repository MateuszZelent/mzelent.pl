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
});
