import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

/**
 * Validates whether the incoming request is from an authenticated admin.
 * Checks both Next.js cookie store and raw cookie headers as fallback.
 */
export async function isAuthorizedAdmin(request?: Request): Promise<boolean> {
  let token: string | undefined;

  try {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  } catch {
    // If called outside Next.js cookies context, fall back to parsing header
  }

  if (!token && request) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    return false;
  }

  try {
    const { valid } = await verifySessionToken(token);
    return valid;
  } catch {
    return false;
  }
}
