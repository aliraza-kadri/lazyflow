import { NextResponse } from "next/server";
import { getOrCreateAdminUser, createPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inputEmail = (body.email || "").trim().toLowerCase();

    if (!inputEmail) {
      return NextResponse.json(
        { error: "Please enter your registered admin email address." },
        { status: 400 }
      );
    }

    const admin = await getOrCreateAdminUser();

    // Check if input email matches admin email or username
    const matches =
      inputEmail === admin.email.toLowerCase() ||
      inputEmail === (admin.username || "").toLowerCase() ||
      inputEmail === "admin";

    if (!matches) {
      return NextResponse.json(
        { error: "No admin account found matching this email address." },
        { status: 404 }
      );
    }

    // Generate token
    const token = await createPasswordResetToken(admin.email);

    // Determine base URL
    const origin =
      request.headers.get("origin") ||
      (request.headers.get("x-forwarded-host")
        ? `https://${request.headers.get("x-forwarded-host")}`
        : "https://lazyflow.in");

    const resetUrl = `${origin}/admin/reset-password?token=${token}`;

    // Send email
    const emailResult = await sendPasswordResetEmail({
      to: admin.email,
      resetUrl,
    });

    return NextResponse.json({
      success: true,
      email: admin.email,
      sentEmail: emailResult.sent,
      provider: emailResult.provider,
      // Provide reset link as fallback if email sending is not yet configured on Vercel
      fallbackResetUrl: !emailResult.sent ? resetUrl : undefined,
      message: emailResult.sent
        ? `A password reset link has been sent to ${admin.email}. Please check your inbox!`
        : `Password reset link generated!`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request. Please try again." },
      { status: 500 }
    );
  }
}
