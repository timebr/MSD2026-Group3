/**
 * Locally-generated ID for records created offline, before they have a
 * server-assigned ID. Not cryptographically strong — fine for a client-side
 * temporary key, not for anything security-sensitive.
 */
export function generateId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}
