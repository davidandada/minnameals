import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const passwordCookie = request.cookies.get("app_password")?.value;
  const isPasswordPage = request.nextUrl.pathname.startsWith("/password");

  if (passwordCookie !== "1234" && !isPasswordPage) {
    return NextResponse.redirect(new URL("/password", request.url));
  }

  if (passwordCookie === "1234" && isPasswordPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.*|apple-touch-icon.*|site\\.webmanifest).*)",
  ],
};