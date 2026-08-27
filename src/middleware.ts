import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isPromoterArea = pathname.startsWith("/promoter") && pathname !== "/promoter/login";

  if (!isAdminArea && !isPromoterArea) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginPath = isAdminArea ? "/admin/login" : "/promoter/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (isAdminArea && session.role !== "admin") {
    return NextResponse.redirect(new URL("/promoter", request.url));
  }
  if (isPromoterArea && session.role !== "promoter") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/promoter/:path*"],
};
