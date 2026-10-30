import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "ttg_admin_session";

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || "Admin";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "2026";
}

export function getAdminSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "tranquil-terrace-galle-admin-secret-key-2026";
}

// Legacy constants kept for compatibility with existing imports
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Admin";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "2026";

export function verifyAdminCredentials(user?: string | null, pass?: string | null): boolean {
  if (!user || !pass) return false;
  const expectedUser = getAdminUsername().trim().toLowerCase();
  const expectedPass = getAdminPassword().trim();
  const actualUser = user.trim().toLowerCase();
  const actualPass = pass.trim();

  // Use timing-safe comparison where length permits
  if (actualUser !== expectedUser) return false;

  const actualBuf = Buffer.from(actualPass);
  const expectedBuf = Buffer.from(expectedPass);
  if (actualBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(actualBuf, expectedBuf);
}

export function createAdminToken(username = getAdminUsername()): string {
  const timestamp = Date.now().toString();
  const secret = getAdminSessionSecret();
  const signature = createHmac("sha256", secret)
    .update(`${username}:${timestamp}`)
    .digest("hex");
  return `${username}:${timestamp}:${signature}`;
}

export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [username, timestamp, signature] = parts;
  if (username.toLowerCase() !== getAdminUsername().toLowerCase()) return false;

  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime)) return false;

  // 7 days expiration
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - tokenTime > maxAgeMs) return false;

  const secret = getAdminSessionSecret();
  const expectedSig = createHmac("sha256", secret)
    .update(`${username}:${timestamp}`)
    .digest("hex");

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length) return false;
    return timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

export function parseCookies(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const list: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0]?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.slice(1).join("=").trim());
    }
  });
  return list;
}

/**
 * Validates request authentication strictly via signed session cookies.
 * Client-supplied owner-header bypasses have been removed.
 */
export function isAdminRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie");
  const parsed = parseCookies(cookieHeader);
  const token = parsed[ADMIN_COOKIE_NAME];
  if (verifyAdminToken(token)) return true;

  // Check Bearer authorization header if provided by server requests
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    if (verifyAdminToken(bearerToken)) return true;
  }

  return false;
}

export async function isServerAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminToken(token);
  } catch {
    return false;
  }
}

export async function requireAdmin(returnTo = "/admin") {
  const isAuth = await isServerAdminAuthenticated();
  if (!isAuth) {
    redirect(returnTo);
  }
  return { username: getAdminUsername(), displayName: "Admin" };
}

// =============================================================================
// Security: Login Rate Limiting (Sliding Window per IP)
// =============================================================================
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const loginAttempts = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }
  entry.count++;
  return { allowed: true };
}

export function resetLoginRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

// =============================================================================
// Security: Origin / CSRF Verification for State-Modifying Requests
// =============================================================================
export function verifyAdminOrigin(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host") || request.headers.get("x-forwarded-host");

  if (!origin && !referer) {
    // Direct same-origin or API call without browser origin header
    return true;
  }

  const target = origin || referer || "";
  if (!host) return true;

  try {
    const parsed = new URL(target);
    const targetHost = parsed.host.toLowerCase();
    const currentHost = host.toLowerCase();

    return (
      targetHost === currentHost ||
      targetHost.endsWith("tranquilterracegalle.com") ||
      targetHost.endsWith("tranquilterracevilla.com") ||
      targetHost.endsWith("vercel.app") ||
      targetHost.startsWith("localhost") ||
      targetHost.startsWith("127.0.0.1")
    );
  } catch {
    return false;
  }
}
