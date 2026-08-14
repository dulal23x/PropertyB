export interface AppEnv {
  // Cloudflare D1 Database binding
  DB: D1Database;

  // Cloudflare R2 Bucket binding (optional)
  PROPERTY_IMAGES?: R2Bucket;

  // Cloudflare Assets binding
  ASSETS?: Fetcher;

  // Secrets
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_WEBHOOK_SECRET?: string;

  // Environment variables
  ENVIRONMENT?: string;
  RELEASE_ID?: string;
  PUBLIC_APP_URL?: string;
  PUBLIC_API_URL?: string;
  PUBLIC_DEFAULT_CONTACT_PHONE?: string;
  PUBLIC_WHATSAPP_NUMBER?: string;
  JWT_ISSUER?: string;
  JWT_AUDIENCE?: string;
}
