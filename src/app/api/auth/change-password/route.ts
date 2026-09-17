import { NextResponse } from "next/server";
import {
  getOrCreateAdminUser,
  verifyPassword,
  updateAdminPassword,
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
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

    await updateAdminPassword(newPassword);

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to change password." },
      { status: 500 }
    );
  }
}
