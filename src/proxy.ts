import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import appFetch from "./app/api/fetch";

export async function proxy(request: NextRequest) {
  const isPasswordPage = request.nextUrl.pathname.startsWith("/password");

  const res = await appFetch('v1/auth');
  if (res.ok) {
    const isAuthenticated = (await res.json()).success;

    console.log(isAuthenticated, isPasswordPage)

    if (isAuthenticated && isPasswordPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    else if (!isAuthenticated && !isPasswordPage) {
      return NextResponse.redirect(new URL("/password", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.*|apple-touch-icon.*|site\\.webmanifest).*)",
  ],
};