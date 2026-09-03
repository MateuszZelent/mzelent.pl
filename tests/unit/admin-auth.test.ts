import { describe, expect, it } from "vitest";

import {
  checkRateLimit,
  createSessionToken,
  recordFailedAttempt,
  resetRateLimit,
  validateImageBuffer,
  verifyAdminPassword,
  verifySessionToken,
} from "../../src/lib/auth/admin-auth";

describe("Admin Cryptographic Authentication", () => {
  it("verifies the default administration password correctly", () => {
    expect(verifyAdminPassword("spintronics2026")).toBe(true);
    expect(verifyAdminPassword("wrong-password")).toBe(false);
    expect(verifyAdminPassword("")).toBe(false);
    expect(verifyAdminPassword("spintronics2027")).toBe(false);
  });

  it("generates and verifies valid HMAC-SHA256 session tokens", () => {
    const token = createSessionToken();
    expect(token).toContain(".");

    const isValid = verifySessionToken(token);
    expect(isValid).toBe(true);
  });

  it("rejects tampered or forged session tokens", () => {
    const token = createSessionToken();
    const [payload, signature] = token.split(".");

    // Altered signature
    const tamperedSig = `${payload}.${signature}abc`;
    expect(verifySessionToken(tamperedSig)).toBe(false);

    // Altered payload
    const tamperedPayload = `eyJyb2xlIjoiYWRtaW4ifQ.${signature}`;
    expect(verifySessionToken(tamperedPayload)).toBe(false);

    // Malformed token strings
    expect(verifySessionToken("")).toBe(false);
    expect(verifySessionToken("invalid-token-without-dots")).toBe(false);
    expect(verifySessionToken(undefined)).toBe(false);
  });

  it("enforces sliding window rate limiting on failed authentication attempts", () => {
    const testKey = "client-rate-limit-test-ip";
    resetRateLimit(testKey);

    // Initial attempt allowed
    expect(checkRateLimit(testKey).allowed).toBe(true);

    // Simulate 4 failed attempts
    for (let i = 0; i < 4; i++) {
      const result = recordFailedAttempt(testKey);
      expect(result.locked).toBe(false);
    }

    expect(checkRateLimit(testKey).allowed).toBe(true);

    // 5th failed attempt locks out the client
    const fifthResult = recordFailedAttempt(testKey);
    expect(fifthResult.locked).toBe(true);
    expect(fifthResult.retryAfterSeconds).toBeGreaterThan(0);

    // Subsequent checks reflect lockout
    const lockedStatus = checkRateLimit(testKey);
    expect(lockedStatus.allowed).toBe(false);
    expect(lockedStatus.retryAfterSeconds).toBeGreaterThan(0);

    // Reset unlocks
    resetRateLimit(testKey);
    expect(checkRateLimit(testKey).allowed).toBe(true);
  });

  it("validates image buffer magic bytes and rejects unauthorized payloads", () => {
    // Valid JPEG: FF D8 FF
    const jpegBuf = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
    ]);
    const jpegRes = validateImageBuffer(jpegBuf);
    expect(jpegRes.valid).toBe(true);
    expect(jpegRes.format).toBe("jpeg");

    // Valid PNG: 89 50 4E 47 0D 0A 1A 0A
    const pngBuf = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    ]);
    const pngRes = validateImageBuffer(pngBuf);
    expect(pngRes.valid).toBe(true);
    expect(pngRes.format).toBe("png");

    // Valid WEBP: RIFF....WEBP
    const webpBuf = Buffer.concat([
      Buffer.from("RIFF"),
      Buffer.from([0x20, 0x00, 0x00, 0x00]),
      Buffer.from("WEBP"),
      Buffer.from([0x56, 0x50, 0x38, 0x20]),
    ]);
    const webpRes = validateImageBuffer(webpBuf);
    expect(webpRes.valid).toBe(true);
    expect(webpRes.format).toBe("webp");

    // Invalid non-image buffer (e.g. bash script or text)
    const scriptBuf = Buffer.from("#!/bin/bash\necho hello world; exit 0");
    const scriptRes = validateImageBuffer(scriptBuf);
    expect(scriptRes.valid).toBe(false);
    expect(scriptRes.error).toContain("Unsupported");

    // Empty buffer
    expect(validateImageBuffer(Buffer.alloc(0)).valid).toBe(false);
  });
});
