import { describe, expect, it } from "vitest";

import { grants, profile, publications, researchDomains, software, talks } from "../../src/content";
import {
  generatePersonJsonLd,
  generateScholarlyArticleJsonLd,
  generateSoftwareApplicationJsonLd,
} from "../../src/content/seo/json-ld";

describe("Phase 3 Information and Content Model", () => {
  it("validates academic profile metadata through Zod schema", () => {
    expect(profile.name).toBe("Mateusz Zelent");
    expect(profile.identifiers.orcid).toMatch(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/);
    expect(profile.affiliation.institution).toContain("Adam Mickiewicz University");
    expect(profile.researchInterests.length).toBeGreaterThanOrEqual(3);
  });

  it("validates authentic peer-reviewed publications with DOIs and bibtex", () => {
    expect(publications.length).toBeGreaterThanOrEqual(3);

    for (const pub of publications) {
      expect(pub.title.length).toBeGreaterThan(10);
      expect(pub.doi.length).toBeGreaterThan(3);
      expect(pub.doiUrl).toMatch(/^https:\/\/doi\.org\//);
      expect(pub.bibtex).toContain("@article");
      expect(pub.year).toBeGreaterThanOrEqual(2018);
    }
  });

  it("validates scientific software tools and licenses", () => {
    expect(software.length).toBeGreaterThanOrEqual(2);

    for (const tool of software) {
      expect(tool.name).toBeTruthy();
      expect(tool.repoUrl).toMatch(/^https:\/\/github\.com\//);
      expect(tool.license).toMatch(/MIT|GPL/);
      expect(tool.highlights.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("validates funded research grants and project numbers", () => {
    expect(grants.length).toBeGreaterThanOrEqual(3);

    for (const grant of grants) {
      expect(grant.grantNumber).toBeTruthy();
      expect(grant.funder).toMatch(/National Science Centre|European Union/);
      expect(grant.role).toBeTruthy();
    }
  });

  it("validates primary research domains and mathematical notations", () => {
    expect(researchDomains.length).toBe(3);

    const ids = researchDomains.map((d) => d.id);
    expect(ids).toContain("topological-solitons");
    expect(ids).toContain("spin-wave-optics");
    expect(ids).toContain("gpu-vector-fields");

    for (const domain of researchDomains) {
      expect(domain.index).toMatch(/^\d{2}$/);
      expect(domain.keyConcepts.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("generates compliant Schema.org JSON-LD structures for SEO", () => {
    const personLd = generatePersonJsonLd(profile);
    expect(personLd["@type"]).toBe("Person");
    expect(personLd.name).toBe("Mateusz Zelent");

    const articleLd = generateScholarlyArticleJsonLd(publications[0]);
    expect(articleLd["@type"]).toBe("ScholarlyArticle");
    expect(articleLd.identifier.value).toBe(publications[0].doi);

    const softwareLd = generateSoftwareApplicationJsonLd(software[0]);
    expect(softwareLd["@type"]).toBe("SoftwareApplication");
    expect(softwareLd.name).toBe(software[0].name);
  });
});
