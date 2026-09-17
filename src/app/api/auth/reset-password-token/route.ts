import { NextResponse } from "next/server";
import {
  verifyPasswordResetToken,
  consumePasswordResetToken,
  createSessionToken,
  getOrCreateAdminUser,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";

  if (!token) {
    return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
  }

  const { valid, email } = await verifyPasswordResetToken(token);
  return NextResponse.json({ valid, email });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = (body.token || "").trim();
    const newPassword = (body.newPassword || "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Missing reset token." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const success = await consumePasswordResetToken(token, newPassword);
    if (!success) {
      return NextResponse.json(
        { error: "This password reset link is invalid, has expired, or was already used." },
        { status: 400 }
      );
    }

    // Issue session token so user is automatically signed in
    const admin = await getOrCreateAdminUser();
    const sessionToken = await createSessionToken(admin.id);

    const response = NextResponse.json({
      success: true,
      message: "Password reset successfully! You are now logged in.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_SECONDS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Consume reset token error:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
