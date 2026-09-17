export const SESSION_COOKIE_NAME = "lf_admin_session";
export const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

const AUTH_SECRET =
  process.env.ADMIN_SESSION_SECRET || "lazyflow-auth-secret-key-prod-2026-secure";

// Base64URL encoding/decoding using standard Web APIs compatible with Edge and Node.js
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function getSigningKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(userId: string): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = `${userId}:${expiry}`;
  const enc = new TextEncoder();

  const key = await getSigningKey();
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return toBase64Url(`${payload}:${sig}`);
}

export async function verifySessionToken(
  token: string
): Promise<{ valid: boolean; userId?: string }> {
  try {
    if (!token || typeof token !== "string") return { valid: false };
    const decoded = fromBase64Url(token);
    const parts = decoded.split(":");
    if (parts.length !== 3) return { valid: false };

    const [userId, expiryStr, sig] = parts;
    const expiry = parseInt(expiryStr, 10);
    const now = Math.floor(Date.now() / 1000);

    if (isNaN(expiry) || now > expiry) {
      return { valid: false };
    }

    const payload = `${userId}:${expiryStr}`;
    const enc = new TextEncoder();
    const key = await getSigningKey();
    const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
    const expectedSig = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (sig !== expectedSig) {
      return { valid: false };
    }

    return { valid: true, userId };
  } catch {
    return { valid: false };
  }
}
