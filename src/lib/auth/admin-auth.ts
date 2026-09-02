import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "mzelent_admin_session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_SECRET = "mzelent-spintronics-cryptographic-secret-2026";
const DEFAULT_PASSWORD = "spintronics2026";

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

/**
 * Constant-time comparison to prevent timing attacks.
 */
export function verifyAdminPassword(candidate: string): boolean {
  const actualPassword = getAdminPassword();
  const candidateBuf = Buffer.from(candidate, "utf-8");
  const actualBuf = Buffer.from(actualPassword, "utf-8");

  if (candidateBuf.length !== actualBuf.length) {
    return false;
  }

  return timingSafeEqual(candidateBuf, actualBuf);
}

/**
 * Creates an HMAC-SHA256 signed session token.
 */
export function createSessionToken(): string {
  const payload = JSON.stringify({
    role: "admin",
    exp: Date.now() + SESSION_DURATION_MS,
  });

  const b64Payload = Buffer.from(payload, "utf-8").toString("base64url");
  const signature = createHmac("sha256", getSecretKey()).update(b64Payload).digest("base64url");

  return `${b64Payload}.${signature}`;
}

/**
 * Validates the HMAC-SHA256 signature and expiration of a session token.
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [b64Payload, signature] = parts;

  try {
    const expectedSig = createHmac("sha256", getSecretKey()).update(b64Payload).digest("base64url");

    const sigBuf = Buffer.from(signature, "utf-8");
    const expBuf = Buffer.from(expectedSig, "utf-8");

    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return false;
    }

    const payloadJson = Buffer.from(b64Payload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
      return false;
    }

    return payload.role === "admin";
  } catch {
    return false;
  }
}
