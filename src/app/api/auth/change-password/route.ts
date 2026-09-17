import { NextResponse } from "next/server";
import {
  getOrCreateAdminUser,
  getAdminProfile,
  verifyPassword,
  updateAdminCredentials,
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );
    const token = cookies[SESSION_COOKIE_NAME];
    const { valid } = await verifySessionToken(token);

    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getAdminProfile();
    return NextResponse.json({
      email: profile.email,
      username: profile.username,
      recoveryPin: profile.recoveryPin,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load admin profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check session
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );
    const token = cookies[SESSION_COOKIE_NAME];
    const { valid } = await verifySessionToken(token);

    if (!valid) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const currentPassword = (body.currentPassword || "").trim();
    const newPassword = (body.newPassword || "").trim();
    const newUsername = (body.newUsername || "").trim();
    const newEmail = (body.newEmail || "").trim();
    const newRecoveryPin = (body.newRecoveryPin || "").trim();

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to save security changes." },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const admin = await getOrCreateAdminUser();
    const isMatch = await verifyPassword(currentPassword, admin.passwordHash, admin.salt);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    await updateAdminCredentials({
      newPassword: newPassword || undefined,
      newEmail: newEmail || undefined,
      newUsername: newUsername || undefined,
      newRecoveryPin: newRecoveryPin || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Admin security details updated successfully.",
    });
  } catch (error) {
    console.error("Change credentials error:", error);
    return NextResponse.json(
      { error: "Failed to update security credentials." },
      { status: 500 }
    );
  }
}
