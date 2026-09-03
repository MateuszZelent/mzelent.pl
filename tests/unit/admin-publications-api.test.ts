import { describe, expect, it } from "vitest";

import { createSessionToken, verifySessionToken } from "../../src/lib/auth/admin-auth";
import { type Publication, PublicationSchema } from "../../src/content/schemas/publication.schema";
import { publicationsData } from "../../src/content/data/publications";

describe("Admin Publications Backend & Schema Validation", () => {
  it("authoritative publications dataset contains valid records matching PublicationSchema", () => {
    expect(publicationsData.length).toBeGreaterThan(10);
    for (const pub of publicationsData.slice(0, 10)) {
      const parsed = PublicationSchema.safeParse(pub);
      expect(parsed.success).toBe(true);
    }
  });

  it("validates publication records parsed from BibTeX inputs", () => {
    const validPub: Publication = {
      id: "zelent2024-test-publication",
      title: "Chiral Spin-Wave Dynamics in Curvilinear Ferromagnetic Nanomembranes",
      authors: ["M. Zelent", "P. Pirro", "M. Krawczyk"],
      year: 2024,
      journal: "Physical Review B",
      volume: "110",
      issue: "4",
      pages: "044415",
      doi: "10.1103/PhysRevB.110.044415",
      doiUrl: "https://doi.org/10.1103/PhysRevB.110.044415",
      abstract: "Investigation of chiral curvature-induced spin-wave interactions under DMI.",
      keywords: ["Curvilinear Magnetism", "Spin Waves", "DMI"],
      featured: true,
      openAccess: true,
      bibtex: "@article{zelent2024chiral,\n  title={Chiral Spin-Wave Dynamics},\n  year={2024}\n}",
      citations: 12,
    };

    const result = PublicationSchema.safeParse(validPub);
    expect(result.success).toBe(true);
  });

  it("rejects invalid publication payloads missing required metadata", () => {
    const invalidPub = {
      id: "invalid-pub",
      // missing title
      authors: ["M. Zelent"],
      year: "not-a-number",
      journal: "PRB",
    };

    const result = PublicationSchema.safeParse(invalidPub);
    expect(result.success).toBe(false);
  });

  it("verifies session token requirements for admin endpoints", () => {
    // Valid session token created with secret
    const validToken = createSessionToken();
    expect(verifySessionToken(validToken)).toBe(true);

    // Unauthenticated / forged tokens rejected
    expect(verifySessionToken(undefined)).toBe(false);
    expect(verifySessionToken("")).toBe(false);
    expect(verifySessionToken("fake-token.abc")).toBe(false);
  });
});
