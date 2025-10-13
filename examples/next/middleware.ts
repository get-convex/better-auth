import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const signInRoutes = ["/sign-in", "/sign-up", "/verify-2fa", "/reset-password"];

export default async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const isSignInRoute = signInRoutes.includes(request.nextUrl.pathname);

  if (isSignInRoute) {
    return NextResponse.next();
  }

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets and api routes
  matcher: ["/((?!.*\\..*|_next|api/auth).+)", "/trpc(.*)"],
};
