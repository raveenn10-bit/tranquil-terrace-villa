import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminToken,
  ADMIN_COOKIE_NAME,
  getAdminUsername,
  checkLoginRateLimit,
  resetLoginRateLimit,
  verifyAdminOrigin,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Origin / CSRF check
    if (!verifyAdminOrigin(request)) {
      return NextResponse.json(
        { error: "Forbidden: cross-origin submission detected." },
        { status: 403 }
      );
    }

    // 2. IP-based rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkLoginRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please wait ${rateCheck.retryAfterSeconds} seconds and try again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
        }
      );
    }

    // 3. Verify credentials
    const body = (await request.json().catch(() => ({}))) as { username?: string; password?: string };
    const { username, password } = body || {};

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "Invalid username or password. Please try again." },
        { status: 401 }
      );
    }

    // 4. Success: reset rate limit & issue signed session cookie
    resetLoginRateLimit(ip);
    const activeUsername = getAdminUsername();
    const token = createAdminToken(activeUsername);

    const response = NextResponse.json({
      success: true,
      user: activeUsername,
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
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
