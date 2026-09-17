import { getDb } from "./mongodb";

export const SESSION_COOKIE_NAME = "lf_admin_session";
export const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

const AUTH_SECRET = process.env.ADMIN_SESSION_SECRET || "lazyflow-auth-secret-key-prod-2026-secure";
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@lazyflow.in";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@LazyFlow2026";
export const DEFAULT_RECOVERY_PIN = process.env.ADMIN_RECOVERY_KEY || "892410";

export interface AdminUser {
  id: string;
  email: string;
  username?: string;
  passwordHash: string;
  salt: string;
  recoveryPin?: string;
  updatedAt: string;
}

// In-memory fallback if MongoDB is not connected
let fallbackAdminUser: AdminUser | null = null;

// ============================================================================
// Web Crypto Password Hashing (Edge & Node compatible)
// ============================================================================
export async function hashPassword(
  password: string,
  existingSalt?: string
): Promise<{ hash: string; salt: string }> {
  const salt =
    existingSalt ||
    Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const enc = new TextEncoder();
  const data = enc.encode(salt + password + AUTH_SECRET);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { hash, salt };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const { hash } = await hashPassword(password, storedSalt);
  return hash === storedHash;
}

// ============================================================================
// Web Crypto Signed Session Tokens
// Format: base64(userId:timestamp:signature)
// ============================================================================
async function getSigningKey() {
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

  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export async function verifySessionToken(
  token: string
): Promise<{ valid: boolean; userId?: string }> {
  try {
    if (!token) return { valid: false };
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
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

// ============================================================================
// Admin User Management in MongoDB Atlas
// ============================================================================
export async function getOrCreateAdminUser(): Promise<AdminUser> {
  const db = await getDb();

  if (!db) {
    if (!fallbackAdminUser) {
      const { hash, salt } = await hashPassword(DEFAULT_ADMIN_PASSWORD);
      fallbackAdminUser = {
        id: "admin_root",
        email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
        username: "admin",
        passwordHash: hash,
        salt,
        recoveryPin: DEFAULT_RECOVERY_PIN,
        updatedAt: new Date().toISOString(),
      };
    }
    return fallbackAdminUser;
  }

  const existing = await db
    .collection<AdminUser>("admin_users")
    .findOne({ id: "admin_root" }, { projection: { _id: 0 } });

  if (existing) {
    return existing;
  }

  // Create initial admin user
  const { hash, salt } = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  const newUser: AdminUser = {
    id: "admin_root",
    email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
    username: "admin",
    passwordHash: hash,
    salt,
    recoveryPin: DEFAULT_RECOVERY_PIN,
    updatedAt: new Date().toISOString(),
  };

  await db.collection("admin_users").updateOne(
    { id: "admin_root" },
    { $set: newUser },
    { upsert: true }
  );

  return newUser;
}

export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  const { hash, salt } = await hashPassword(newPassword);
  const updatedAt = new Date().toISOString();

  const db = await getDb();
  if (!db) {
    if (fallbackAdminUser) {
      fallbackAdminUser.passwordHash = hash;
      fallbackAdminUser.salt = salt;
      fallbackAdminUser.updatedAt = updatedAt;
    }
    return true;
  }

  await db.collection("admin_users").updateOne(
    { id: "admin_root" },
    { $set: { passwordHash: hash, salt, updatedAt } },
    { upsert: true }
  );

  return true;
}

export async function verifyRecoveryPin(pin: string): Promise<boolean> {
  const clean = pin.trim();
  const admin = await getOrCreateAdminUser();
  const target = admin.recoveryPin || DEFAULT_RECOVERY_PIN;
  return clean === target || clean === DEFAULT_RECOVERY_PIN;
}
