import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth/admin-auth";
import { type BlogPost, BlogPostSchema } from "../../../../content/schemas/blog.schema";
import { blogPostsData } from "../../../../content/data/blog";

function getBlogDataFilePath(): string {
  return resolve(process.cwd(), "src/content/data/blog.ts");
}

function persistBlogPosts(posts: BlogPost[]) {
  const filePath = getBlogDataFilePath();
  const fileContent = `import type { BlogPost } from "../schemas/blog.schema";

export const blogPostsData: BlogPost[] = ${JSON.stringify(posts, null, 2)};
`;
  writeFileSync(filePath, fileContent, "utf-8");
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ posts: blogPostsData });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    let newPost: BlogPost;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const title = (formData.get("title") as string)?.trim();
      const date = (formData.get("date") as string)?.trim() || new Date().toISOString().split("T")[0];
      const category = (formData.get("category") as string)?.trim() || "Laboratory";
      const location = (formData.get("location") as string)?.trim() || "RPTU / UAM";
      const description = (formData.get("description") as string)?.trim();
      const imageAlt = (formData.get("imageAlt") as string)?.trim() || title;
      const tagsStr = (formData.get("tags") as string) || "Spintronics, Research";
      const tags = tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const instrument = (formData.get("instrument") as string)?.trim();
      const magneticField = (formData.get("magneticField") as string)?.trim();
      const temperature = (formData.get("temperature") as string)?.trim();

      const imageFile = formData.get("image") as File | null;
      let imageUrl = (formData.get("imageUrl") as string)?.trim() || "";

      if (imageFile && imageFile.size > 0) {
        const uploadDir = resolve(process.cwd(), "public/uploads/blog");
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        const safeExt = imageFile.name.split(".").pop()?.toLowerCase() || "webp";
        const filename = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${safeExt}`;
        const filePath = resolve(uploadDir, filename);

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        writeFileSync(filePath, buffer);

        imageUrl = `/uploads/blog/${filename}`;
      }

      if (!imageUrl) {
        imageUrl = "/images/blog/skyrmion-lattice-sim.webp";
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const id = `post-${Date.now()}`;

      const rawPost: Record<string, unknown> = {
        id,
        slug,
        title,
        date,
        category,
        location,
        description,
        imageUrl,
        imageAlt,
        tags,
        featured: false,
      };

      if (instrument || magneticField || temperature) {
        rawPost.technicalDetails = {
          instrument: instrument || undefined,
          magneticField: magneticField || undefined,
          temperature: temperature || undefined,
        };
      }

      newPost = BlogPostSchema.parse(rawPost);
    } else {
      const json = await request.json();
      newPost = BlogPostSchema.parse(json);
    }

    // Prepend new post to the dataset
    const updated = [newPost, ...blogPostsData.filter((p) => p.id !== newPost.id)];
    persistBlogPosts(updated);

    return NextResponse.json({ success: true, post: newPost });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Validation or save error";
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
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const updated = blogPostsData.filter((p) => p.id !== id);
    persistBlogPosts(updated);

    return NextResponse.json({ success: true, message: `Post ${id} removed` });
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
