import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";
import { isAdminPasswordConfigured } from "@/lib/auth/admin-env";

export async function isAdminRequestAuthorized(): Promise<boolean> {
  if (!isAdminPasswordConfigured()) return true;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}
