import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "beto_admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type StaffRole = "owner" | "assistant";

/** Who is logged in. Rayane (ADMIN_PASSWORD) is the owner; Lauren is a staff_users row. */
export type AdminSession = { role: StaffRole; userId: string; name: string };

const OWNER: AdminSession = { role: "owner", userId: "owner", name: "Rayane" };

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/**
 * Creates a signed, expiring session token (no server-side storage needed).
 * Payload: `expiresAt|role|userId|name` (base64url name). Tokens issued before
 * roles existed carry only `expiresAt` and are read as the owner.
 */
export function createSessionToken(session: AdminSession = OWNER): string {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = [expiresAt, session.role, session.userId, Buffer.from(session.name).toString("base64url")].join("|");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(sign(payload));
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;

  const [expires, role, userId, name] = payload.split("|");
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
  if (role === undefined) return OWNER;
  if (role !== "owner" && role !== "assistant") return null;
  return { role, userId, name: name ? Buffer.from(name, "base64url").toString() : "" };
}

export function verifySessionToken(token: string | undefined | null): boolean {
  return readSessionToken(token) !== null;
}

/** scrypt hash stored as `scrypt$salt$hash` (hex). Never store or log a plain password. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 32).toString("hex")}`;
}

export function checkPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}
