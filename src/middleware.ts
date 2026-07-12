import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Redirect root path to invitationhomes.com
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect("https://invitationhomes.com");
  }

  // Continue with auth middleware for all other paths
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
