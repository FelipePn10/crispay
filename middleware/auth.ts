import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const session = await prisma.session.findFirst({
    where: {
      token: token,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  // Add user to request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.user.id);
  requestHeaders.set("x-user-address", session.user.wallets[0]?.address || "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/protected/:path*", "/dashboard/:path*"],
};
