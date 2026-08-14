/**
 * Request pipeline middleware: X-Request-ID, CORS, Security Headers, Error mapping
 * Follows Chapter 54 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

export interface RequestContext {
  requestId: string;
  startTime: number;
  url: URL;
  clientIp: string;
}

export function createRequestContext(req: Request): RequestContext {
  const incomingId = req.headers.get("X-Request-ID");
  const requestId = incomingId || crypto.randomUUID();
  const url = new URL(req.url);
  const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "127.0.0.1";

  return {
    requestId,
    startTime: performance.now(),
    url,
    clientIp,
  };
}

export function applySecurityHeaders(headers: Headers): void {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
}

export function createJsonResponse(
  data: unknown,
  status = 200,
  requestId?: string,
  extraHeaders?: Record<string, string>
): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
  });

  if (requestId) {
    headers.set("X-Request-ID", requestId);
  }

  applySecurityHeaders(headers);

  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) {
      headers.set(k, v);
    }
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export function createErrorResponse(
  detail: string,
  status = 400,
  requestId?: string,
  errors?: unknown
): Response {
  const payload: Record<string, unknown> = { detail };
  if (requestId) {
    payload.request_id = requestId;
  }
  if (errors) {
    payload.errors = errors;
  }

  return createJsonResponse(payload, status, requestId);
}
