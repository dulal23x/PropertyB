/**
 * Web Crypto PBKDF2-SHA256 Implementation with 100% Passlib Compatibility
 * Follows Chapters 17, 32 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

// Helper to decode Passlib custom base64 (where '.' is used instead of '+')
function decodePasslibBase64(str: string): Uint8Array {
  let standardB64 = str.replace(/\./g, "+");
  while (standardB64.length % 4 !== 0) {
    standardB64 += "=";
  }
  const binary = atob(standardB64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper to encode Uint8Array to Passlib custom base64
function encodePasslibBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const standardB64 = btoa(binary);
  return standardB64.replace(/\+/g, ".").replace(/=/g, "");
}

/**
 * Verifies a plaintext password against a Passlib-formatted PBKDF2-SHA256 hash.
 * Example hash: "$pbkdf2-sha256$29000$KeV8D2HsXeud01rLubeWkg$prZdPPWOK6EfooK5PzX2w4gsal6cGgVQCI.T.J3Q0oo"
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash || typeof hash !== "string") {
    return false;
  }

  // Format: $pbkdf2-sha256$<rounds>$<salt>$<checksum>
  const parts = hash.split("$");
  if (parts.length !== 5 || parts[1] !== "pbkdf2-sha256") {
    return false;
  }

  const rounds = parseInt(parts[2], 10);
  if (isNaN(rounds) || rounds <= 0) {
    return false;
  }

  try {
    const saltBytes = decodePasslibBase64(parts[3]);
    const expectedChecksum = parts[4];

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBytes as unknown as BufferSource,
        iterations: rounds,
        hash: "SHA-256",
      },
      keyMaterial,
      256 // 32 bytes * 8
    );

    const computedChecksum = encodePasslibBase64(new Uint8Array(derivedBits));
    return computedChecksum === expectedChecksum;
  } catch (err) {
    console.error("Password verification error:", err);
    return false;
  }
}

/**
 * Hashes a plaintext password using PBKDF2-SHA256 in Passlib-compatible format.
 */
export async function hashPassword(password: string, rounds = 29000): Promise<string> {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes as unknown as BufferSource,
      iterations: rounds,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const saltB64 = encodePasslibBase64(saltBytes);
  const checksumB64 = encodePasslibBase64(new Uint8Array(derivedBits));

  return `$pbkdf2-sha256$${rounds}$${saltB64}$${checksumB64}`;
}
