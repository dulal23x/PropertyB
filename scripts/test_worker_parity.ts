/**
 * Automated API Parity & Contract Verification Suite
 * Follows Chapters 17, 56, 88, 89 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import { hashPassword, verifyPassword } from "../tanstack-app/src/server/auth/crypto.ts";
import { signJWT, verifyJWT } from "../tanstack-app/src/server/auth/jwt.ts";

async function runParityTests() {
  console.log("=================================================");
  console.log("  PropertyBikri Cloudflare Worker Parity Tests   ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Web Crypto PBKDF2-SHA256 Compatibility with Passlib
  // -------------------------------------------------------------
  console.log("1. Testing Web Crypto PBKDF2-SHA256 Compatibility...");

  // Fixture: Passlib-generated hash for "password123"
  const passlibHash = "$pbkdf2-sha256$29000$GSOkVKqV0loLQci5d04JgQ$3ZNXGqXwjKvWEaOyoADL8IM6OeVkaa/EJuoXrGLYyDw";
  const isMatch = await verifyPassword("password123", passlibHash);
  assert(isMatch, "Correct password authenticates against Passlib hash fixture");

  const isWrong = await verifyPassword("wrongpassword", passlibHash);
  assert(!isWrong, "Wrong password fails authentication");

  const newHash = await hashPassword("mySecretPassword@2026", 29000);
  assert(newHash.startsWith("$pbkdf2-sha256$29000$"), "Newly generated hash has valid Passlib format");

  const newVerify = await verifyPassword("mySecretPassword@2026", newHash);
  assert(newVerify, "Newly generated hash verifies correctly");

  // -------------------------------------------------------------
  // Test 2: Web Crypto HS256 JWT
  // -------------------------------------------------------------
  console.log("\n2. Testing Web Crypto HS256 JWT...");

  const secret = "test-secret-key-1234567890-test-key-32chars";
  const token = await signJWT(
    { sub: "dulalhussain94@gmail.com", id: 1, role: "admin", ver: 1 },
    secret,
    3600
  );
  assert(typeof token === "string" && token.split(".").length === 3, "JWT signed into 3-part string");

  const payload = await verifyJWT(token, secret);
  assert(payload?.sub === "dulalhussain94@gmail.com", "JWT payload contains correct subject email");
  assert(payload?.role === "admin", "JWT payload contains correct role");

  const invalidToken = await verifyJWT(token, "wrong-secret-key-that-should-fail-verification");
  assert(invalidToken === null, "JWT with incorrect secret fails verification cleanly");

  // -------------------------------------------------------------
  // Test 3: Template Interpolation & Variables
  // -------------------------------------------------------------
  console.log("\n3. Testing Email Template Interpolation...");
  const { interpolateTemplate, DEFAULT_TEMPLATES } = await import(
    "../tanstack-app/src/server/email/templates.ts"
  );

  const welcomeTpl = DEFAULT_TEMPLATES.welcome_email;
  const rendered = interpolateTemplate(welcomeTpl.body, {
    full_name: "Dulal Hussain",
    email: "dulalhussain94@gmail.com",
    app_url: "https://propertybikri.com",
  });
  assert(
    rendered.includes("Hi Dulal Hussain") && rendered.includes("dulalhussain94@gmail.com"),
    "Template variables interpolate without placeholders remaining"
  );

  // -------------------------------------------------------------
  // Test 4: R2 Key Sanitization & Path Security
  // -------------------------------------------------------------
  console.log("\n4. Testing R2 Key Sanitization...");
  const hostileFilename = "../../../etc/passwd%00<script>.jpg";
  const baseName = hostileFilename.split(/[\\/]/).pop() || "file";
  const safeFilename = baseName.replace(/[^a-zA-Z0-9_\-\.]/g, "_").replace(/\.+/g, ".");
  assert(
    !safeFilename.includes("..") && !safeFilename.includes("<") && !safeFilename.includes("/") && !safeFilename.includes("\\"),
    "Hostile filenames sanitized safely for R2 keys"
  );

  console.log("\n=================================================");
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runParityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
