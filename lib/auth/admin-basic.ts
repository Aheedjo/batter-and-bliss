/**
 * Constant-time comparison for equal-length strings (Edge-safe).
 * Use only when lengths are already known to match.
 */
function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export function verifyAdminBasicAuth(
  authorizationHeader: string | null,
  expectedUser: string,
  expectedPassword: string,
): boolean {
  if (!authorizationHeader || !authorizationHeader.startsWith("Basic ")) {
    return false;
  }
  const encoded = authorizationHeader.slice(6).trim();
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }
  const colon = decoded.indexOf(":");
  if (colon < 0) return false;
  const user = decoded.slice(0, colon);
  const password = decoded.slice(colon + 1);
  return (
    timingSafeEqualString(user, expectedUser) &&
    timingSafeEqualString(password, expectedPassword)
  );
}
