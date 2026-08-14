/**
 * Web Crypto HS256 JWT Implementation
 * Follows Chapter 57 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

export interface JWTPayload {
  sub: string; // User email or subject
  id?: number; // User ID
  role?: string;
  ver?: number; // Token version for instant invalidation
  iss?: string;
  aud?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

function base64UrlEncode(data: Uint8Array | string): string {
  let str = "";
  if (typeof data === "string") {
    str = btoa(data);
  } else {
    for (let i = 0; i < data.byteLength; i++) {
      str += String.fromCharCode(data[i]);
    }
    str = btoa(str);
  }
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) {
    b64 += "=";
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signJWT(
  payload: JWTPayload,
  secret: string,
  expiresInSeconds = 60 * 60 * 24 * 7 // 7 days default
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: payload.iat ?? now,
    exp: payload.exp ?? now + expiresInSeconds,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const enc = new TextEncoder();
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const key = await getCryptoKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(signingInput)
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  return `${signingInput}.${encodedSignature}`;
}

export async function verifyJWT(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedHeader)));
    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const key = await getCryptoKey(secret);
    const signatureBytes = base64UrlDecode(encodedSignature);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      new TextEncoder().encode(signingInput)
    );

    if (!isValid) {
      return null;
    }

    const payload: JWTPayload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(encodedPayload))
    );

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}
