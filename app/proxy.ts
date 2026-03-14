import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const keyHash = request.cookies.get("keyHash")?.value;
  const { pathname } = request.nextUrl;

  // Allow home page always
  if (pathname === "/") {
    // If already logged in, redirect to dashboard
    if (keyHash) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes: redirect to home if no key
  if (!keyHash) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
