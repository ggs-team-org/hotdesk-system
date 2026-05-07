import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isAuthenticated = !!session?.user;
  const path = nextUrl.pathname;

  const isProtected =
    path.startsWith("/book") ||
    path.startsWith("/my-bookings") ||
    path.startsWith("/admin");

  if (isProtected && !isAuthenticated) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/admin") && session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/book", nextUrl));
  }

  if (path === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/book", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run on every route except next internals and static files
    "/((?!api/auth|_next/static|_next/image|favicon.ico|brand|floors|logo).*)",
  ],
};
