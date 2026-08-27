import crypto from "node:crypto";

// Avoids ambiguous characters (0/O, 1/I) since these get read off a phone screen
const SAFE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomString(length: number): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SAFE_CHARS[bytes[i] % SAFE_CHARS.length];
  }
  return out;
}

export function generatePromoterLoginId(): string {
  return `PRM-${randomString(6)}`;
}

export function generateTempPassword(): string {
  return randomString(8);
}
