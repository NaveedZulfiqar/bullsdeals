import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import { getJwtSecret } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { User, Agent } = await connectToDatabase();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    const agent = user
      ? null
      : await Agent.findOne({ email: normalizedEmail, registeredByAgent: true }).select("+password");

    if (!user && !agent) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const account = user || agent;
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (agent?.approvalStatus === "pending") {
      return NextResponse.json(
        { error: "Your registration is still pending administrator approval.", status: "pending" },
        { status: 403 }
      );
    }
    if (agent?.approvalStatus === "rejected") {
      return NextResponse.json(
        { error: "Your registration was declined. Please contact the administrator.", status: "rejected" },
        { status: 403 }
      );
    }

    const role = user ? "admin" : "agent";
    const name = user ? user.name : `${agent.firstName} ${agent.lastName}`.trim();
    const token = jwt.sign(
      {
        userId: account._id.toString(),
        email: account.email,
        name,
        role,
        ...(agent ? { agentId: agent._id.toString() } : {}),
      },
      getJwtSecret(),
      { expiresIn: "1d" }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: account._id,
        email: account.email,
        name,
        role,
        ...(agent ? { agentId: agent._id } : {}),
      },
      redirectTo: role === "admin" ? "/dashboard" : "/agent/profile",
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: error?.message || "An error occurred during authentication" },
      { status: 500 }
    );
  }
}
