import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { getJwtSecret } from "@/lib/auth-config";

export { getJwtSecret };

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  role: "admin" | "agent";
  agentId?: string;
};

export function getSession(request: NextRequest | Request): SessionUser | null {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("token="))
      ?.slice("token=".length);

    if (!token) return null;
    return jwt.verify(decodeURIComponent(token), getJwtSecret()) as SessionUser;
  } catch {
    return null;
  }
}

export function isAdmin(request: NextRequest | Request) {
  return getSession(request)?.role === "admin";
}
