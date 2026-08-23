import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const SYSTEM_ROUTES = ["/admin", "/api", "/login", "/register", "/dashboard"];
const INTERNAL_ROUTES = ["/platform", "/portfolio"];
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

  const hostname = req.headers.get("host") || "";
  const isLoggedIn = !!req.auth;
  
  // 3. Hostname Logic
  const hostOnly = hostname.split(":")[0];
  const isDevSubdomain = hostOnly.startsWith("dev.");
  const isRootDomain = !isDevSubdomain;

  // 4. Auth Redirection
  if (isDevSubdomain && isLoggedIn && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 5. Route Classification
  const isSystemRoute = SYSTEM_ROUTES.some((route) => path.startsWith(route));
  const isInternalRoute = INTERNAL_ROUTES.some((route) => path.startsWith(route));

  // 6. Root Domain Strategy (Platform)
  if (isRootDomain) {
    // Only allow root / and system routes
    if (path === "/") {
      return NextResponse.rewrite(new URL("/platform", req.url));
    }

    if (isSystemRoute || isInternalRoute) {
      return NextResponse.next();
    }

    // Protection: Any other path on root domain should NOT resolve to a portfolio.
    // We rewrite to a non-existent path to trigger a 404 for this domain.
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  // 7. Subdomain Strategy (Portfolio Product)
  if (isDevSubdomain) {
    if (!isSystemRoute && !isInternalRoute) {
      // Rewrite root of dev subdomain to the portfolio landing page
      if (path === "/") {
        return NextResponse.rewrite(new URL("/portfolio", req.url));
      }
      
      // Other paths (like /username) are served by the dynamic [username] route
      return NextResponse.next();
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
  ],
};
