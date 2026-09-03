import { NextResponse } from "next/server";

import { blogPostsData } from "../../../content/data/blog";

export async function GET() {
  return NextResponse.json({
    posts: blogPostsData,
    count: blogPostsData.length,
    timestamp: new Date().toISOString(),
  });
}
