import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getJwtSecret } from "@/lib/auth-config";

export const runtime = "experimental-edge";

type SessionUser = {
  role: "admin" | "agent";
  exp?: number;
};

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedHeader)));
    if (header.alg !== "HS256") return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getJwtSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
    if (!valid) return null;

    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload))) as SessionUser;
    if ((session.role !== "admin" && session.role !== "agent") || (session.exp && session.exp * 1000 < Date.now())) return null;
    return session;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  const session = await verifySession(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  if (path.startsWith("/dashboard") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/agent/profile", request.url));
  }
  if (path.startsWith("/agent") && session.role !== "agent") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/agent/:path*"],
};
