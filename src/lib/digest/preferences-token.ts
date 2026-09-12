import { createHmac, timingSafeEqual } from "crypto";

/** Long enough to click through from an email, short enough to bound exposure
 * if a link leaks (forwarded, shared, cached in a mail client, etc.). */
const TOKEN_TTL_MS = 30 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.DIGEST_PREFERENCES_SECRET;
  if (!secret) throw new Error("DIGEST_PREFERENCES_SECRET is not configured.");
  return secret;
}

/**
 * Proves control of `email`'s inbox for the digest-preferences flow. Access to
 * a member's topic selections used to be gated on the email string alone —
 * anyone who knew a member's address could read/overwrite their preferences.
 * This token is emailed as part of a link (see requestPreferencesLink in
 * actions.ts) rather than typed in by the visitor, so possessing it is
 * itself evidence the requester received that email.
 */
export function signPreferencesToken(email: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const signature = createHmac("sha256", getSecret()).update(`${email}:${expiresAt}`).digest("hex");
  return { token: `${expiresAt}.${signature}`, expiresAt };
}

export function verifyPreferencesToken(email: string, token: string | null | undefined): boolean {
  if (!token) return false;

  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;
  const expiresAtStr = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  const expiresAt = Number(expiresAtStr);
  if (!expiresAtStr || !signature || Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const expected = createHmac("sha256", getSecret()).update(`${email}:${expiresAt}`).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}
