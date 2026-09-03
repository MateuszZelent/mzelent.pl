import { NextResponse } from "next/server";

import { profileData } from "../../../content/data/profile";

export async function GET() {
  return NextResponse.json({
    profile: profileData,
    timestamp: new Date().toISOString(),
  });
}
