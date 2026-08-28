import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Read the cookie from request headers
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, v] = c.split("=");
        return [k?.trim(), v?.trim()];
      })
    );

    const token = cookies["token"];

    if (!token) {
      return NextResponse.json({ authenticated: false, error: "No token found" }, { status: 401 });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as any;
    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        agentId: decoded.agentId,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: "Invalid token" }, { status: 401 });
  }
}
