import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const keyHash = request.cookies.get("keyHash")?.value;
  const { pathname } = request.nextUrl;

  // Allow home page always
  if (pathname === "/") {
    if (keyHash) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Board pages are publicly accessible (embeddable URLs)
  if (pathname.startsWith("/board/")) {
    return NextResponse.next();
  }

  // All other routes require auth
  if (!keyHash) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
