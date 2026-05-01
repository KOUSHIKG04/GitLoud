import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutePatterns = [
  /^\/dashboard(?:\/.*)?$/,
  /^\/api\/pr(?:\/.*)?$/,
  /^\/api\/generations(?:\/.*)?$/,
];

function isProtectedRoute(pathname: string) {
  return protectedRoutePatterns.some((pattern) => pattern.test(pathname));
}

export default async function proxy(request: NextRequest) {
  if (!isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session?.user) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
