/**
 * Short opaque id for domain entities that need a client-generated key
 * (locations, sources). URL-safe base36, ~8 chars — collision-safe for the
 * scale of this app (single user, tens of entities).
 */
export function shortId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 0x7fffffff).toString(36);
  return `${prefix}_${stamp}_${rand}`;
}
