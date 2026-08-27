import { SignJWT, jwtVerify } from "jose";

// This file must stay Edge-runtime safe (no `next/headers`, no Node-only APIs)
// because src/middleware.ts imports it and middleware runs on the Edge runtime.

export type SessionRole = "admin" | "promoter";

export interface SessionPayload {
  id: number;
  role: SessionRole;
  name: string;
  loginId?: string;
  [key: string]: unknown;
}

const secretKey = process.env.JWT_SECRET;
if (!secretKey && process.env.NODE_ENV !== "test") {
  console.warn("JWT_SECRET is not set — add it to your .env file before going further.");
}
const encodedKey = new TextEncoder().encode(secretKey || "dev-secret-change-me");

export async function createSessionToken(payload: SessionPayload, expiresIn = "8h") {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "ticket_app_session";
