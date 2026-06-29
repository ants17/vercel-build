import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, isValidAuthCookie, safeRedirectPath } from "@/lib/auth/password";

const PUBLIC_PATHS = new Set(["/login", "/api/auth/login"]);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = await isValidAuthCookie(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (PUBLIC_PATHS.has(pathname)) {
    if (pathname === "/login" && authenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (authenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") || pathname.startsWith("/eve/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  const next = safeRedirectPath(`${pathname}${search}`);
  if (next !== "/") loginUrl.searchParams.set("next", next);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
