import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_for_bullsdeals_brokerage_portal_2026_06_24";

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

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: "Invalid token" }, { status: 401 });
  }
}
