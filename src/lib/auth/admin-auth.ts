import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "mzelent_admin_session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_SECRET = "mzelent-spintronics-cryptographic-secret-2026";
const DEFAULT_PASSWORD = "spintronics2026";

// Rate limiting configurations
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitRecord {
  failedAttempts: number;
  firstFailedAt: number;
  lockedUntil: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

/**
 * Checks whether an identifier (e.g. client IP) is currently rate-limited.
 */
export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  // Check if locked
  if (record.lockedUntil > now) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds: retryAfter };
  }

  // Window expired, reset
  if (now - record.firstFailedAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.delete(key);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Records a failed authentication attempt and locks if threshold is breached.
 */
export function recordFailedAttempt(key: string): { locked: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now - record.firstFailedAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, {
      failedAttempts: 1,
      firstFailedAt: now,
      lockedUntil: 0,
    });
    return { locked: false, retryAfterSeconds: 0 };
  }

  record.failedAttempts += 1;

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + RATE_LIMIT_WINDOW_MS;
    const retryAfter = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
    return { locked: true, retryAfterSeconds: retryAfter };
  }

  return { locked: false, retryAfterSeconds: 0 };
}

/**
 * Resets rate-limit tracker on successful authentication.
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
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

/**
 * Validates file buffer magic bytes to ensure authentic, uncompromised images.
 * Rejects non-image files and enforces 10MB payload ceiling.
 */
export function validateImageBuffer(buffer: Buffer): {
  valid: boolean;
  format?: "jpeg" | "png" | "webp" | "avif";
  error?: string;
} {
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  if (buffer.length === 0) {
    return { valid: false, error: "Empty file buffer" };
  }

  if (buffer.length > MAX_SIZE_BYTES) {
    return { valid: false, error: "Image exceeds 10MB file size ceiling" };
  }

  if (buffer.length < 16) {
    return { valid: false, error: "File buffer too short to verify header" };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: "jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: "png" };
  }

  // WEBP: RIFF (bytes 0-3) ... WEBP (bytes 8-11)
  const isRiff = buffer.toString("ascii", 0, 4) === "RIFF";
  const isWebp = buffer.toString("ascii", 8, 12) === "WEBP";
  if (isRiff && isWebp) {
    return { valid: true, format: "webp" };
  }

  // AVIF: bytes 4-12 contains ftypavif or ftypavis
  const ftyp = buffer.toString("ascii", 4, 12);
  if (ftyp === "ftypavif" || ftyp === "ftypavis") {
    return { valid: true, format: "avif" };
  }

  return { valid: false, error: "Unsupported or corrupted image file signature" };
}
