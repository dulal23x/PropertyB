/**
 * Authorization and Authentication Middleware
 * Follows Chapter 58 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import { verifyJWT, type JWTPayload } from "../auth/jwt";
import { UsersRepository } from "../db/repositories/users.repo";
import type { DbUser } from "../types/models";

export interface AuthContext {
  token: string | null;
  payload: JWTPayload | null;
  user: DbUser | null;
}

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7).trim();
}

export async function resolveAuth(
  req: Request,
  jwtSecret: string,
  usersRepo: UsersRepository
): Promise<AuthContext> {
  const token = extractBearerToken(req);
  if (!token) {
    return { token: null, payload: null, user: null };
  }

  const payload = await verifyJWT(token, jwtSecret);
  if (!payload || !payload.sub) {
    return { token, payload: null, user: null };
  }

  const user = await usersRepo.findByEmail(payload.sub);
  if (!user || user.is_active !== 1) {
    return { token, payload, user: null };
  }

  // Token version verification
  if (payload.ver && payload.ver < user.auth_version) {
    return { token, payload, user: null }; // Invalidated token
  }

  return { token, payload, user };
}

export function requireAuth(auth: AuthContext): DbUser {
  if (!auth.user) {
    throw new Response(
      JSON.stringify({ detail: "Not authenticated or invalid/expired credentials" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  return auth.user;
}

export function requireAdmin(auth: AuthContext): DbUser {
  const user = requireAuth(auth);
  if (user.role !== "admin") {
    throw new Response(
      JSON.stringify({ detail: "Administrator privileges required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return user;
}
