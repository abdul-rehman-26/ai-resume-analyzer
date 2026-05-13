import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/token";

const AUTH_PAGES = ["/signin", "/signup"];
const PROTECTED_API_ROUTES = ["/api/me", "/api/analyze"];

function isProtectedPage(pathname) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/upload") ||
    pathname.startsWith("/results")
  );
}

function isProtectedApi(pathname) {
  return (
    PROTECTED_API_ROUTES.includes(pathname) ||
    pathname.startsWith("/api/analysis/")
  );
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  let isAuthenticated = false;

  if (token) {
    try {
      await verifyAuthToken(token);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (AUTH_PAGES.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/upload", request.url));
  }

  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/upload", request.url));
  }

  const needsAuth = isProtectedPage(pathname) || isProtectedApi(pathname);

  if (needsAuth && !isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/dashboard/:path*",
    "/upload/:path*",
    "/results/:path*",
    "/api/me",
    "/api/analyze",
    "/api/analysis/:path*",
  ],
};
