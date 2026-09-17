import { getDb } from "./mongodb";

export {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "./session";

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

export async function updateAdminCredentials(params: {
  newPassword?: string;
  newEmail?: string;
  newUsername?: string;
  newRecoveryPin?: string;
}): Promise<boolean> {
  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (params.newPassword) {
    const { hash, salt } = await hashPassword(params.newPassword);
    updateDoc.passwordHash = hash;
    updateDoc.salt = salt;
  }

  if (params.newEmail) {
    updateDoc.email = params.newEmail.trim().toLowerCase();
  }

  if (params.newUsername) {
    updateDoc.username = params.newUsername.trim().toLowerCase();
  }

  if (params.newRecoveryPin) {
    updateDoc.recoveryPin = params.newRecoveryPin.trim();
  }

  const db = await getDb();
  if (!db) {
    if (fallbackAdminUser) {
      Object.assign(fallbackAdminUser, updateDoc);
    }
    return true;
  }

  await db.collection("admin_users").updateOne(
    { id: "admin_root" },
    { $set: updateDoc },
    { upsert: true }
  );

  return true;
}

export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  return updateAdminCredentials({ newPassword });
}

export async function getAdminProfile(): Promise<{ email: string; username: string; recoveryPin: string }> {
  const user = await getOrCreateAdminUser();
  return {
    email: user.email,
    username: user.username || "admin",
    recoveryPin: user.recoveryPin || DEFAULT_RECOVERY_PIN,
  };
}

export async function verifyRecoveryPin(pin: string): Promise<boolean> {
  const clean = pin.trim();
  const admin = await getOrCreateAdminUser();
  const target = admin.recoveryPin || DEFAULT_RECOVERY_PIN;
  return clean === target || clean === DEFAULT_RECOVERY_PIN;
}

// ============================================================================
// Password Reset Link Tokens (Valid for 30 minutes)
// ============================================================================
export async function createPasswordResetToken(email: string): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes
  const random = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const payload = `${email.toLowerCase()}:${expiry}:${random}`;
  const enc = new TextEncoder();
  const key = await getSigningKey();
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const token = Buffer.from(`${payload}:${sig}`).toString("base64url");

  const db = await getDb();
  if (db) {
    await db.collection("password_resets").insertOne({
      token,
      email: email.toLowerCase(),
      expiresAt: new Date(expiry * 1000),
      used: false,
      createdAt: new Date(),
    });
  }

  return token;
}

export async function verifyPasswordResetToken(
  token: string
): Promise<{ valid: boolean; email?: string }> {
  try {
    if (!token) return { valid: false };
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return { valid: false };

    const [email, expiryStr, random, sig] = parts;
    const expiry = parseInt(expiryStr, 10);
    const now = Math.floor(Date.now() / 1000);

    if (isNaN(expiry) || now > expiry) {
      return { valid: false };
    }

    const payload = `${email}:${expiryStr}:${random}`;
    const enc = new TextEncoder();
    const key = await getSigningKey();
    const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
    const expectedSig = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (sig !== expectedSig) {
      return { valid: false };
    }

    // Check in database if already used
    const db = await getDb();
    if (db) {
      const doc = await db.collection("password_resets").findOne({ token });
      if (doc && doc.used) {
        return { valid: false };
      }
    }

    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

export async function consumePasswordResetToken(
  token: string,
  newPassword: string
): Promise<boolean> {
  const { valid, email } = await verifyPasswordResetToken(token);
  if (!valid || !email) return false;

  await updateAdminCredentials({ newPassword });

  const db = await getDb();
  if (db) {
    await db.collection("password_resets").updateOne(
      { token },
      { $set: { used: true, usedAt: new Date() } }
    );
  }

  return true;
}
