import { NextResponse } from "next/server";
import {
  verifyRecoveryPin,
  updateAdminCredentials,
  createSessionToken,
  getOrCreateAdminUser,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const recoveryPin = (body.recoveryPin || "").trim();
    const newPassword = (body.newPassword || "").trim();

    if (!recoveryPin) {
      return NextResponse.json(
        { error: "Please enter your Master Recovery PIN." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const isPinValid = await verifyRecoveryPin(recoveryPin);
    if (!isPinValid) {
      return NextResponse.json(
        { error: "Incorrect Master Recovery PIN. Please verify your PIN." },
        { status: 401 }
      );
    }

    // Update password and optional new username/email
    const newIdentifier = (body.newIdentifier || body.newUsername || body.newEmail || "").trim();
    const updateParams: { newPassword: string; newEmail?: string; newUsername?: string } = {
      newPassword,
    };
    if (newIdentifier) {
      if (newIdentifier.includes("@")) {
        updateParams.newEmail = newIdentifier;
      } else {
        updateParams.newUsername = newIdentifier;
      }
    }
    await updateAdminCredentials(updateParams);

    const admin = await getOrCreateAdminUser();
    const token = await createSessionToken(admin.id);

    const response = NextResponse.json({
      success: true,
      message: "Password reset successfully! You are now logged in.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_SECONDS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
