"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminPasswordEnv,
  getAdminUsernameEnv,
} from "@/lib/auth/admin-env";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
} from "@/lib/auth/admin-session";

export type AdminLoginState = { error: string } | null;

function eq(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function loginAdmin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!expectedPassword?.length) {
    return {
      error:
        "Admin password is not configured. Set ADMIN_PASSWORD in your environment.",
    };
  }

  const expectedUser = (process.env.ADMIN_USER ?? "admin").trim();
  const username = (formData.get("username")?.toString() ?? "").trim();
  const password = (formData.get("password")?.toString() ?? "").trim();

  if (!eq(username, expectedUser) || !eq(password, expectedPassword)) {
    return { error: "Wrong username or password." };
  }

  const token = await createAdminSessionToken();
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete({
    name: ADMIN_SESSION_COOKIE,
    path: "/",
  });
  redirect("/admin/login");
}
