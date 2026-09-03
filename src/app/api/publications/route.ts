import { NextResponse } from "next/server";

import { publicationsData } from "../../../content/data/publications";

export async function GET() {
  return NextResponse.json({
    publications: publicationsData,
    count: publicationsData.length,
    timestamp: new Date().toISOString(),
  });
}
