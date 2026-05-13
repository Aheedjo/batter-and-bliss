/**
 * Single place for admin credential env resolution.
 * Supports legacy ADMIN_BASIC_AUTH_* from the previous HTTP Basic setup.
 */
export function getAdminPasswordEnv(): string {
  return (
    process.env.ADMIN_PASSWORD?.trim() ||
    process.env.ADMIN_BASIC_AUTH_PASSWORD?.trim() ||
    ""
  );
}

export function isAdminPasswordConfigured(): boolean {
  return getAdminPasswordEnv().length > 0;
}

export function getAdminUsernameEnv(): string {
  const raw =
    process.env.ADMIN_USER?.trim() ||
    process.env.ADMIN_BASIC_AUTH_USER?.trim() ||
    "";
  return raw.length > 0 ? raw : "admin";
}
