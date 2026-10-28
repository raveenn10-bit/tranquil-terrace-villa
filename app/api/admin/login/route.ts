import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminToken,
  ADMIN_COOKIE_NAME,
  ADMIN_USERNAME,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { username?: string; password?: string };
    const { username, password } = body || {};

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "Invalid username or password. Please try again." },
        { status: 401 }
      );
    }

    const token = createAdminToken(ADMIN_USERNAME);
    const response = NextResponse.json({
      success: true,
      user: ADMIN_USERNAME,
      message: "Authentication successful.",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
