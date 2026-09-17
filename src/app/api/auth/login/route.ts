import { NextResponse } from "next/server";
import {
  getOrCreateAdminUser,
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.identifier || body.email || body.username || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Please enter both identifier (email/username) and password." },
        { status: 400 }
      );
    }

    const admin = await getOrCreateAdminUser();

    // Check email or username
    const matchesIdentifier =
      identifier === admin.email.toLowerCase() ||
      identifier === (admin.username || "admin").toLowerCase() ||
      identifier === "admin" ||
      identifier === "hello.lazyflow@gmail.com";

    if (!matchesIdentifier) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, admin.passwordHash, admin.salt);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createSessionToken(admin.id);

    const response = NextResponse.json({
      success: true,
      user: { email: admin.email, username: admin.username || "admin" },
    });

    // Set HTTP-only secure cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_SECONDS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate. Please try again." },
      { status: 500 }
    );
  }
}
