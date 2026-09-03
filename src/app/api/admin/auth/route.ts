import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  checkRateLimit,
  createSessionToken,
  recordFailedAttempt,
  resetRateLimit,
  verifyAdminPassword,
  verifySessionToken,
} from "../../../../lib/auth/admin-auth";

function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "localhost-client";
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = verifySessionToken(sessionToken);

  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(request: Request) {
  const clientKey = getClientIdentifier(request);

  // Enforce sliding window rate limit
  const rateLimitStatus = checkRateLimit(clientKey);
  if (!rateLimitStatus.allowed) {
    return NextResponse.json(
      {
        error: `Security lockout: Too many failed login attempts. Retry in ${rateLimitStatus.retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimitStatus.retryAfterSeconds) },
      },
    );
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      const lockResult = recordFailedAttempt(clientKey);
      if (lockResult.locked) {
        return NextResponse.json(
          {
            error: `Maximum attempts exceeded. Access locked for ${lockResult.retryAfterSeconds} seconds.`,
          },
          {
            status: 429,
            headers: { "Retry-After": String(lockResult.retryAfterSeconds) },
          },
        );
      }

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Reset rate limiter on successful authentication
    resetRateLimit(clientKey);

    const token = createSessionToken();
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, message: "Authenticated successfully" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);

  return NextResponse.json({ success: true, message: "Logged out" });
}
