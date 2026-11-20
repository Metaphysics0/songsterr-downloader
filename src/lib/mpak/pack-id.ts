/**
 * The pack `id` (spec section 4, "Pack identity"). This converter makes the same pack again from the same song, so it
 * uses the derived id: the UUID version 5 (RFC 4122) of the primary score's SHA-256 (64 lowercase hex characters, as
 * UTF-8) in the spec's namespace. Another tool that derives an id for the same score file chooses the same one.
 */
export const PACK_ID_NAMESPACE = "03924935-9520-4f8c-91cd-ebd5f6cf57c5";

export async function derivedPackId(scoreSha256: string): Promise<string> {
  const namespace = PACK_ID_NAMESPACE.replace(/-/g, "")
    .match(/../g)!
    .map((pair) => parseInt(pair, 16));
  const name = new TextEncoder().encode(scoreSha256.toLowerCase());
  const input = new Uint8Array(namespace.length + name.length);
  input.set(namespace);
  input.set(name, namespace.length);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-1", input)).slice(
    0,
    16,
  );
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = Array.from(hash, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
