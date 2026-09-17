import { NextResponse } from "next/server";
import {
  getOrCreateAdminUser,
  createPasswordResetToken,
  updateAdminCredentials,
} from "@/lib/auth";
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

    // Check if input email matches admin email, username, or known admin aliases
    const matches =
      inputEmail === admin.email.toLowerCase() ||
      inputEmail === (admin.username || "").toLowerCase() ||
      inputEmail === "admin" ||
      inputEmail === "hello.lazyflow@gmail.com" ||
      admin.email.toLowerCase() === "admin@lazyflow.in";

    if (!matches) {
      return NextResponse.json(
        {
          error: `No account found matching "${inputEmail}". Current admin email is "${admin.email}" (or username "${admin.username || "admin"}"). You can also use the Master Recovery PIN tab.`,
        },
        { status: 404 }
      );
    }

    const targetEmail = inputEmail.includes("@") ? inputEmail : admin.email;

    // If admin had the placeholder email, automatically update to user's real email
    if (inputEmail.includes("@") && admin.email.toLowerCase() !== inputEmail) {
      await updateAdminCredentials({ newEmail: inputEmail });
    }

    // Generate token
    const token = await createPasswordResetToken(targetEmail);

    // Determine base URL
    const origin =
      request.headers.get("origin") ||
      (request.headers.get("x-forwarded-host")
        ? `https://${request.headers.get("x-forwarded-host")}`
        : "https://lazyflow.in");

    const resetUrl = `${origin}/admin/reset-password?token=${token}`;

    // Send email to target recipient
    const emailResult = await sendPasswordResetEmail({
      to: targetEmail,
      resetUrl,
    });

    if (!emailResult.sent) {
      return NextResponse.json(
        {
          error: `Could not send reset email to ${targetEmail}: ${emailResult.error || "Email service error"}. Please check your GMAIL_APP_PASSWORD in Vercel settings or use Master PIN.`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email: targetEmail,
      sentEmail: true,
      message: `A password reset link has been sent to ${targetEmail}. Please check your inbox and Spam folder!`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request. Please try again." },
      { status: 500 }
    );
  }
}
