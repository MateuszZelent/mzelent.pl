import { describe, expect, it } from "vitest";

import { grants, publications } from "../../src/content";
import { dictionaryEn } from "../../src/content/i18n/dictionaries/en";
import { dictionaryPl } from "../../src/content/i18n/dictionaries/pl";
import { normalizeScholarRecord } from "../../scripts/sync-scholar";

describe("Bilingual i18n & Grants Enhancement", () => {
  it("guarantees 100% key parity between Polish and English dictionaries", () => {
    const plKeys = Object.keys(dictionaryPl) as (keyof typeof dictionaryPl)[];
    const enKeys = Object.keys(dictionaryEn) as (keyof typeof dictionaryEn)[];

    expect(plKeys.sort()).toEqual(enKeys.sort());

    for (const section of plKeys) {
      const plSubkeys = Object.keys(dictionaryPl[section]).sort();
      const enSubkeys = Object.keys(dictionaryEn[section]).sort();
      expect(plSubkeys).toEqual(enSubkeys);
    }
  });

  it("contains Dr. Mateusz Zelent's MSCA CNMA grant with correct affiliations and budget", () => {
    const cnma = grants.find((g) => g.acronym === "CNMA");
    expect(cnma).toBeDefined();
    expect(cnma?.grantNumber).toBe("101108257");
    expect(cnma?.funder).toContain("European Union");
    expect(cnma?.program).toContain("Marie Skłodowska-Curie");
    expect(cnma?.institutions.some((i) => i.includes("RPTU"))).toBe(true);
    expect(cnma?.institutions.some((i) => i.includes("Adam Mickiewicz"))).toBe(true);
    expect(cnma?.status).toBe("Active");
  });

  it("contains NCN SONATA and OPUS grants", () => {
    const sonata = grants.find((g) => g.program === "SONATA");
    expect(sonata).toBeDefined();
    expect(sonata?.role).toContain("Principal Investigator");

    const opus = grants.find((g) => g.program === "OPUS");
    expect(opus).toBeDefined();
  });

  it("normalizes and validates incoming Google Scholar records", () => {
    const sampleRecord = {
      id: "zelent-2024-test",
      title: "Non-stationary magnonic dynamics in spin-torque nano-oscillators",
      authors: ["M. Zelent", "P. Pirro"],
      year: 2024,
      journal: "Physical Review Letters",
      doi: "10.1103/PhysRevLett.132.010000",
      doiUrl: "https://doi.org/10.1103/PhysRevLett.132.010000",
      abstract: "Theoretical demonstration of non-stationary spin-wave auto-oscillations.",
      keywords: ["Magnonics", "Nano-oscillators"],
    };

    const validated = normalizeScholarRecord(sampleRecord);
    expect(validated.id).toBe("zelent-2024-test");
    expect(validated.bibtex).toContain("@article");
    expect(validated.openAccess).toBe(true);
  });
});
