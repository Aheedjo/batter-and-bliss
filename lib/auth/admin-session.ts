import { SignJWT, jwtVerify } from "jose";
import { getAdminPasswordEnv } from "@/lib/auth/admin-env";

export const ADMIN_SESSION_COOKIE = "bb_admin_session";

async function signingKey(): Promise<Uint8Array> {
  const pepper = process.env.ADMIN_JWT_PEPPER ?? "";
  const password = getAdminPasswordEnv();
  const material = `${pepper}:${password}`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(material),
  );
  return new Uint8Array(digest);
}

export async function createAdminSessionToken(): Promise<string> {
  const key = await signingKey();
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key);
}

export async function verifyAdminSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, await signingKey(), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}
