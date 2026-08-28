import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

const dateFields = [
  "dateOfBirth",
  "recoLicExpiry",
  "startDate",
  "contractAnniversaryDate",
  "terminationDate",
  "recoLicenseExpiryDate",
  "deskFeeStartDate",
];

export async function POST(request: NextRequest) {
  try {
    const { Agent, User } = await connectToDatabase();
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!body.firstName?.trim() || !body.lastName?.trim() || !email) {
      return NextResponse.json(
        { error: "First name, last name and email are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const [userExists, agentExists] = await Promise.all([
      User.exists({ email }),
      Agent.exists({ email }),
    ]);
    if (userExists || agentExists) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const agentData = { ...body };
    delete agentData.confirmPassword;
    for (const field of dateFields) {
      agentData[field] = agentData[field] || null;
    }
    agentData.email = email;
    agentData.password = await bcrypt.hash(password, 12);
    agentData.approvalStatus = "pending";
    agentData.registeredByAgent = true;
    agentData.reviewedAt = null;
    agentData.isActive = true;

    const agent = await Agent.create(agentData);
    return NextResponse.json(
      {
        success: true,
        status: agent.approvalStatus,
        message: "Registration submitted. An administrator will review your account.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Agent registration error:", error);
    return NextResponse.json(
      { error: error?.name === "ValidationError" ? error.message : "Registration failed" },
      { status: 500 }
    );
  }
}
