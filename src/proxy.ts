import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const STATIC_ASSETS = [".png", ".jpg", ".jpeg", ".svg", ".css", ".js", ".ico", ".webp", ".map"];

export default auth(async function proxy(req) {
  const url = req.nextUrl;
  let path = url.pathname;

  // 1. Static Asset Performance
  if (STATIC_ASSETS.some((ext) => path.toLowerCase().endsWith(ext))) {
    return NextResponse.next();
  }

  // 2. Path Normalization
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  const isLoggedIn = !!req.auth;

  // 3. Auth Redirection: Logged-in user trying to visit /login or /register -> redirect to /admin
  if (isLoggedIn && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
  ],
};
