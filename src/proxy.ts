import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import appFetch from "./app/api/fetch";

export async function proxy(request: NextRequest) {
  const isPasswordPage = request.nextUrl.pathname.startsWith("/password");

  try {
    const res = await appFetch('v1/auth');

    if (!res.ok) {
      const errorHtml = await res.text();
      console.error(`[Middleware Flask Error] ${res.status}:`, errorHtml);

      if (!isPasswordPage) {
        return NextResponse.redirect(new URL("/password", request.url));
      }
      return NextResponse.next(); // Let them load the password page
    }

    const data = await res.json();
    const isAuthenticated = data.success;

    if (isAuthenticated && isPasswordPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    else if (!isAuthenticated && !isPasswordPage) {
      return NextResponse.redirect(new URL("/password", request.url));
    }

  } catch (error) {
    console.error(`[Middleware Fetch Exception]:`, error);
    if (!isPasswordPage) {
      return NextResponse.redirect(new URL("/password", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.*|apple-touch-icon.*|site\\.webmanifest).*)",
  ],
};