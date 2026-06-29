import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  createAuthCookieValue,
  safeRedirectPath,
  verifyPassword,
} from "@/lib/auth/password";

export async function POST(req: Request): Promise<Response> {
  const formData = await req.formData();
  const password = formData.get("password");
  const url = new URL(req.url);
  const next = safeRedirectPath(url.searchParams.get("next"));

  if (typeof password !== "string") {
    return redirectToLogin(req, next);
  }

  let valid = false;
  try {
    valid = await verifyPassword(password);
  } catch (error) {
    console.error("[auth] password verification failed:", error);
  }

  if (!valid) {
    return redirectToLogin(req, next);
  }

  const response = NextResponse.redirect(new URL(next, req.url), { status: 303 });
  response.cookies.set(AUTH_COOKIE_NAME, await createAuthCookieValue(), {
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function redirectToLogin(req: Request, next: string): Response {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("error", "1");
  if (next !== "/") loginUrl.searchParams.set("next", next);
  return NextResponse.redirect(loginUrl, { status: 303 });
}
