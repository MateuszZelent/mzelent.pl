import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth/admin-auth";
import { type Publication, PublicationSchema } from "../../../../content/schemas/publication.schema";
import { publicationsData } from "../../../../content/data/publications";

function getPublicationsDataFilePath(): string {
  return resolve(process.cwd(), "src/content/data/publications.ts");
}

function persistPublications(pubs: Publication[]) {
  const filePath = getPublicationsDataFilePath();
  const fileContent = `import type { Publication } from "../schemas/publication.schema";

// Authoritative publication dataset synchronized from Dr. Mateusz Zelent's Google Scholar profile
export const publicationsData: Publication[] = ${JSON.stringify(pubs, null, 2)};
`;
  writeFileSync(filePath, fileContent, "utf-8");
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ publications: publicationsData });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const newPub = PublicationSchema.parse(json);

    // Prevent duplicate entries by DOI if present
    const existingIndex = publicationsData.findIndex(
      (p) => (p.doi && p.doi.toLowerCase() === newPub.doi?.toLowerCase()) || p.id === newPub.id,
    );

    let updated: Publication[];
    if (existingIndex >= 0) {
      // Update existing
      updated = [...publicationsData];
      updated[existingIndex] = newPub;
    } else {
      // Prepend newly added publication
      updated = [newPub, ...publicationsData];
    }

    persistPublications(updated);

    return NextResponse.json({ success: true, publication: newPub });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Validation or save error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const updatedPub = PublicationSchema.parse(json);

    const exists = publicationsData.some((p) => p.id === updatedPub.id);
    if (!exists) {
      return NextResponse.json({ error: `Publication ${updatedPub.id} not found` }, { status: 404 });
    }

    const updated = publicationsData.map((p) => (p.id === updatedPub.id ? updatedPub : p));
    persistPublications(updated);

    return NextResponse.json({ success: true, publication: updatedPub });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Publication ID is required" }, { status: 400 });
    }

    const updated = publicationsData.filter((p) => p.id !== id);
    persistPublications(updated);

    return NextResponse.json({ success: true, message: `Publication ${id} removed` });
  } catch {
    return NextResponse.json({ error: "Failed to delete publication" }, { status: 500 });
  }
}
