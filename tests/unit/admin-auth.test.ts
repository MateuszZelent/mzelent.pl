import { describe, expect, it } from "vitest";

import { createSessionToken, verifyAdminPassword, verifySessionToken } from "../../src/lib/auth/admin-auth";

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
});
