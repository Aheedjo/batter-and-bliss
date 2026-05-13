import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminPasswordConfigured } from "@/lib/auth/admin-env";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const passwordConfigured = isAdminPasswordConfigured();
  if (!passwordConfigured) {
    return NextResponse.next();
  }

  const onLogin =
    pathname === "/admin/login" || pathname === "/admin/login/";

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const ok = await verifyAdminSessionToken(token);

  if (onLogin) {
    if (ok) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!ok) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
