/**
 * Google Scholar & BibTeX Ingestion Service
 *
 * This script serves as the backend synchronization foundation for Dr. Mateusz Zelent's
 * publications database. It is intended to run as a backend job, admin CLI command,
 * or within the future admin dashboard without degrading client-side page load times.
 */

import { existsSync, writeFileSync } from "fs";
import { resolve } from "path";

import { type Publication, PublicationSchema } from "../src/content/schemas/publication.schema";

export interface ScholarAuthorProfile {
  readonly scholarId: string;
  readonly name: string;
  readonly affiliation: string;
  readonly totalCitations?: number;
  readonly hIndex?: number;
}

export const SCHOLAR_CONFIG: ScholarAuthorProfile = {
  scholarId: "mateusz_zelent",
  name: "Mateusz Zelent",
  affiliation: "RPTU Kaiserslautern-Landau / Adam Mickiewicz University",
};

/**
 * Normalizes a raw BibTeX entry or Scholar record into a validated Publication object.
 */
export function normalizeScholarRecord(record: {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi: string;
  doiUrl: string;
  abstract: string;
  keywords?: string[];
  featured?: boolean;
  openAccess?: boolean;
  bibtex?: string;
}): Publication {
  const normalizedBibtex =
    record.bibtex ||
    `@article{${record.id},
  title = {${record.title}},
  author = {${record.authors.join(" and ")}},
  journal = {${record.journal}},
  year = {${record.year}},
  doi = {${record.doi}}
}`;

  const publication: Publication = {
    id: record.id,
    title: record.title.trim(),
    authors: record.authors.map((a) => a.trim()),
    year: record.year,
    journal: record.journal.trim(),
    doi: record.doi.trim(),
    doiUrl: record.doiUrl.trim(),
    abstract: record.abstract.trim(),
    keywords:
      record.keywords && record.keywords.length > 0 ? record.keywords : ["Magnonics", "Micromagnetics"],
    featured: Boolean(record.featured),
    openAccess: record.openAccess ?? true,
    bibtex: normalizedBibtex,
  };

  // Validate strictly with Zod schema
  return PublicationSchema.parse(publication);
}

/**
 * Synchronizes publication data into src/content/data/publications.ts
 */
export function writePublicationsFile(publications: Publication[], outputPath?: string): void {
  const targetPath = outputPath || resolve(process.cwd(), "src/content/data/publications.ts");

  const fileContent = `import type { Publication } from "../schemas/publication.schema";

// Auto-generated or synchronized via scripts/sync-scholar.ts
export const publicationsData: Publication[] = ${JSON.stringify(publications, null, 2)};
`;

  writeFileSync(targetPath, fileContent, "utf-8");
  console.log(`[sync-scholar] Successfully written ${publications.length} publications to ${targetPath}`);
}

// CLI runner if executed directly
if (process.argv[1]?.endsWith("sync-scholar.ts")) {
  console.log(
    `[sync-scholar] Initializing Scholar sync for ${SCHOLAR_CONFIG.name} (${SCHOLAR_CONFIG.scholarId})...`,
  );
  const target = resolve(process.cwd(), "src/content/data/publications.ts");
  if (existsSync(target)) {
    console.log(`[sync-scholar] Target database exists at ${target}. Ready for ingestion.`);
  }
}
