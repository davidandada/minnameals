import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAuthentication } from "./src/app/api/password";

export async function proxy(request: NextRequest) {
  const isPasswordPage = request.nextUrl.pathname.startsWith("/password");

  try {
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      if (!isPasswordPage) {
        return NextResponse.redirect(new URL("/password", request.url));
      }
      return NextResponse.next(); // Let them load the password page
    }

    if (isAuthenticated && isPasswordPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    else if (!isAuthenticated && !isPasswordPage) {
      return NextResponse.redirect(new URL("/password", request.url));
    }

  } catch (error) {
    console.error(`[Proxy Fetch Exception]:`, error);
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