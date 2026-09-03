import { type NextRequest, NextResponse } from "next/server";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { publicationsData } from "../../../../../content/data/publications";
import { type Publication, PublicationSchema } from "../../../../../content/schemas/publication.schema";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "../../../../../lib/auth/admin-auth";

export interface ScholarAuthorStats {
  totalCitations: number;
  citationsSince2019: number;
  hIndex: number;
  i10Index: number;
}

export interface ScholarParsedWork {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  citations: number;
  scholarId: string;
  scholarUrl: string;
}

export function parseScholarHtml(html: string): {
  stats: ScholarAuthorStats;
  works: ScholarParsedWork[];
} {
  // 1. Extract author metrics from #gsc_rsb_st table
  const stats: ScholarAuthorStats = {
    totalCitations: 0,
    citationsSince2019: 0,
    hIndex: 0,
    i10Index: 0,
  };

  const statMatches = html.match(/<td class="gsc_rsb_std">(\d+)<\/td>/g);
  if (statMatches && statMatches.length >= 6) {
    const nums = statMatches.map((m) => {
      const match = m.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    stats.totalCitations = nums[0] || 0;
    stats.citationsSince2019 = nums[1] || 0;
    stats.hIndex = nums[2] || 0;
    stats.i10Index = nums[4] || 0;
  }

  // 2. Extract publication rows
  const works: ScholarParsedWork[] = [];
  const rowRegex = /<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];

    // Title and Link - independent of attribute order
    const aTagMatch = rowHtml.match(/<a\s+[^>]*class="[^"]*gsc_a_at[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
    const rawTitle = aTagMatch ? aTagMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    const hrefMatch = aTagMatch ? aTagMatch[0].match(/href="([^"]+)"/i) : null;
    const rawUrl = hrefMatch ? hrefMatch[1].replace(/&amp;/g, "&") : "";

    if (!rawTitle) continue;

    const citationIdMatch = rawUrl.match(/citation_for_view=[^:]+:([^&]+)/);
    const scholarId = citationIdMatch ? citationIdMatch[1] : `scholar-${works.length + 1}`;

    // Gray divs for Authors and Journal
    const grayDivs = Array.from(rowHtml.matchAll(/<div class="gs_gray">([\s\S]*?)<\/div>/g));
    const authorsRaw = grayDivs[0] ? grayDivs[0][1].replace(/<[^>]+>/g, "").trim() : "M. Zelent";
    const authors = authorsRaw
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const journalRaw = grayDivs[1] ? grayDivs[1][1].replace(/<[^>]+>/g, "").trim() : "";
    // Clean up trailing comma or year
    const journalClean = journalRaw.replace(/,\s*\d{4}\s*$/, "").trim();

    // Citations
    const citesMatch = rowHtml.match(/<a[^>]+class="gsc_a_ac[^"]*"[^>]*>(\d+)<\/a>/);
    const citations = citesMatch ? parseInt(citesMatch[1], 10) : 0;

    // Year
    const yearMatch = rowHtml.match(/<span class="gsc_a_h[^"]*">(\d{4})<\/span>/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

    works.push({
      title: rawTitle,
      authors: authors.length > 0 ? authors : ["M. Zelent"],
      journal: journalClean || "Academic Publication",
      year,
      citations,
      scholarId,
      scholarUrl: rawUrl.startsWith("http") ? rawUrl : `https://scholar.google.com${rawUrl}`,
    });
  }

  return { stats, works };
}

function normalizeTitle(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function GET(request: NextRequest) {
  // Verify session cookie
  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!sessionToken || !verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "XkzMx4IAAAAJ";
  const autoUpdateCitations = searchParams.get("updateCitations") === "true";

  try {
    const scholarUrl = `https://scholar.google.com/citations?user=${encodeURIComponent(userId)}&hl=en&cstart=0&pagesize=100`;

    const res = await fetch(scholarUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Google Scholar returned status ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    const { stats, works } = parseScholarHtml(html);

    // Cross reference with existing publications in database
    const existingMap = new Map<string, Publication>();
    publicationsData.forEach((p) => {
      existingMap.set(normalizeTitle(p.title), p);
    });

    const newWorks: Publication[] = [];
    const citationUpdates: Array<{ id: string; title: string; oldCitations: number; newCitations: number }> =
      [];

    works.forEach((w) => {
      const norm = normalizeTitle(w.title);
      const existing = existingMap.get(norm);

      if (existing) {
        if (w.citations > (existing.citations || 0)) {
          citationUpdates.push({
            id: existing.id,
            title: existing.title,
            oldCitations: existing.citations || 0,
            newCitations: w.citations,
          });
        }
      } else {
        // Build new valid Publication object
        const newPub: Publication = {
          id: `scholar-${w.scholarId}`,
          title: w.title,
          authors: w.authors,
          year: w.year,
          journal: w.journal,
          doi: `scholar.google.com/citations?view_op=view_citation&user=${userId}&citation_for_view=${userId}:${w.scholarId}`,
          doiUrl: w.scholarUrl,
          abstract: `Indexed from Google Scholar profile (${w.journal}, ${w.year}). Cited ${w.citations} times.`,
          keywords: ["Spintronics", "Nanomagnetism", "Spin Waves"],
          featured: false,
          openAccess: true,
          citations: w.citations,
          bibtex: `@article{zelent_${w.scholarId.replace(/[^a-zA-Z0-9]/g, "")},\n  title = {${w.title}},\n  author = {${w.authors.join(" and ")}},\n  journal = {${w.journal}},\n  year = {${w.year}}\n}`,
        };

        const validated = PublicationSchema.safeParse(newPub);
        if (validated.success) {
          newWorks.push(validated.data);
        }
      }
    });

    // If requested, update citation counts directly in publications.ts
    let updatedCount = 0;
    if (autoUpdateCitations && citationUpdates.length > 0) {
      const updatedList = publicationsData.map((pub) => {
        const update = citationUpdates.find((u) => u.id === pub.id);
        if (update) {
          return { ...pub, citations: update.newCitations };
        }
        return pub;
      });

      const filePath = resolve(process.cwd(), "src/content/data/publications.ts");
      const fileContent = `import type { Publication } from "../schemas/publication.schema";\n\nexport const publicationsData: Publication[] = ${JSON.stringify(
        updatedList,
        null,
        2,
      )};\n`;
      writeFileSync(filePath, fileContent, "utf8");
      updatedCount = citationUpdates.length;
    }

    return NextResponse.json({
      success: true,
      userId,
      stats,
      totalScholarWorks: works.length,
      existingCount: publicationsData.length,
      newWorksCount: newWorks.length,
      citationUpdatesCount: citationUpdates.length,
      citationsUpdatedInDb: updatedCount,
      newWorks,
      citationUpdates,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error syncing with Google Scholar" },
      { status: 500 },
    );
  }
}
