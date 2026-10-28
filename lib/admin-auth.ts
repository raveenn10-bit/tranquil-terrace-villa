import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "ttg_admin_session";
export const ADMIN_USERNAME = "Admin";
export const ADMIN_PASSWORD = "2026";

const SECRET = process.env.ADMIN_SESSION_SECRET || "tranquil-terrace-galle-admin-secret-key-2026";

export function verifyAdminCredentials(user?: string | null, pass?: string | null): boolean {
  if (!user || !pass) return false;
  return user.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() && pass.trim() === ADMIN_PASSWORD;
}

export function createAdminToken(username = "Admin"): string {
  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", SECRET)
    .update(`${username}:${timestamp}`)
    .digest("hex");
  return `${username}:${timestamp}:${signature}`;
}

export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [username, timestamp, signature] = parts;
  if (username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) return false;

  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime)) return false;

  // 7 days expiration
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - tokenTime > maxAgeMs) return false;

  const expectedSig = createHmac("sha256", SECRET)
    .update(`${username}:${timestamp}`)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
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

export function isAdminRequest(request: Request): boolean {
  // Check session cookie
  const cookieHeader = request.headers.get("cookie");
  const parsed = parseCookies(cookieHeader);
  const token = parsed[ADMIN_COOKIE_NAME];
  if (verifyAdminToken(token)) return true;

  // Legacy header fallback for compatibility
  const oaiUser = request.headers.get("oai-authenticated-user-id");
  if (oaiUser && isAdminUserId(oaiUser)) return true;

  return false;
}

export function isAdminUserId(userId?: string | null): boolean {
  if (!userId) return false;
  return userId === "95dfcb1a-261e-4eb7-b813-b3347928b034";
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
    redirect("/admin");
  }
  return { username: ADMIN_USERNAME, displayName: "Admin" };
}
