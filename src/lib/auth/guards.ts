import "server-only";
import { getSession } from "./session";
import type { SessionPayload } from "./token";

// Middleware already blocks unauthenticated page access, but Server Actions
// can in principle be invoked directly, so each admin-only action calls this too.
export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session;
}

export async function requirePromoterSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== "promoter") {
    throw new Error("Not authorized");
  }
  return session;
}
