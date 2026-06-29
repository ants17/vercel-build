export const AUTH_COOKIE_NAME = "brim_auth";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

const encoder = new TextEncoder();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function constantTimeEqual(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;

  for (let i = 0; i < max; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }

  return diff === 0;
}

export function safeRedirectPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/login") || value.startsWith("/api/auth/")) return "/";
  return value;
}

export async function hashPassword(password: string, salt = requiredEnv("SITE_PASSWORD_SALT")) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations: 210_000,
    },
    key,
    256,
  );

  return bytesToBase64Url(new Uint8Array(bits));
}

export async function verifyPassword(password: string): Promise<boolean> {
  const expected = requiredEnv("SITE_PASSWORD_HASH");
  const actual = await hashPassword(password);
  return constantTimeEqual(actual, expected);
}

async function signCookiePayload(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(requiredEnv("SITE_AUTH_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createAuthCookieValue(now = Date.now()): Promise<string> {
  const expiresAt = Math.floor(now / 1000) + AUTH_COOKIE_MAX_AGE_SECONDS;
  const payload = `v1.${expiresAt}`;
  const signature = await signCookiePayload(payload);
  return `${payload}.${signature}`;
}

export async function isValidAuthCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 3) return false;

  const [version, expiresAt, signature] = parts;
  if (version !== "v1") return false;

  const expiresAtSeconds = Number(expiresAt);
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  try {
    const expected = await signCookiePayload(`${version}.${expiresAt}`);
    return constantTimeEqual(signature, expected);
  } catch {
    return false;
  }
}
