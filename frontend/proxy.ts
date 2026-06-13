import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/products",
  "/customers",
  "/inventory",
  "/orders",
  "/production",
  "/invoices",
  "/payments",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token");

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Optional: Redirect authenticated users away from login
  if (pathname.startsWith("/login") && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/customers/:path*",
    "/inventory/:path*",
    "/orders/:path*",
    "/production/:path*",
    "/invoices/:path*",
    "/payments/:path*",
    "/login",
  ],
};
