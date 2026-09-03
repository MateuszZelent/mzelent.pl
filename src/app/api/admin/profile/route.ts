import { type NextRequest, NextResponse } from "next/server";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { profileData } from "../../../../content/data/profile";
import { ProfileSchema } from "../../../../content/schemas/profile.schema";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth/admin-auth";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!sessionToken || !verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ profile: profileData });
}

export async function PUT(request: NextRequest) {
  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!sessionToken || !verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const merged = {
      ...profileData,
      ...body,
      metrics: {
        ...profileData.metrics,
        ...(body.metrics || {}),
      },
      affiliation: {
        ...profileData.affiliation,
        ...(body.affiliation || {}),
      },
      identifiers: {
        ...profileData.identifiers,
        ...(body.identifiers || {}),
      },
      contact: {
        ...profileData.contact,
        ...(body.contact || {}),
      },
    };

    const validated = ProfileSchema.parse(merged);

    const filePath = resolve(process.cwd(), "src/content/data/profile.ts");
    const content = `import type { Profile } from "../schemas/profile.schema";\n\nexport const profileData: Profile = ${JSON.stringify(
      validated,
      null,
      2,
    )};\n`;

    writeFileSync(filePath, content, "utf8");

    return NextResponse.json({
      success: true,
      profile: validated,
      message: "Profil naukowy zaktualizowany pomyślnie!",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update profile data" },
      { status: 400 },
    );
  }
}
