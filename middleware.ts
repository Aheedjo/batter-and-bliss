import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyAdminBasicAuth } from "@/lib/auth/admin-basic";

export function middleware(request: NextRequest) {
  const user = process.env.ADMIN_BASIC_AUTH_USER;
  const password = process.env.ADMIN_BASIC_AUTH_PASSWORD;

  if (!user?.length || !password?.length) {
    return NextResponse.next();
  }

  const ok = verifyAdminBasicAuth(
    request.headers.get("authorization"),
    user,
    password,
  );

  if (ok) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Batter & Bliss Admin"',
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
