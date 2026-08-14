/**
 * Email Provider Interface, Resend HTTP Adapter & Console Fallback
 * Follows Chapters 83, 85, 87 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import { DEFAULT_TEMPLATES, interpolateTemplate } from "./templates";
import { EmailRepository } from "../db/repositories/email.repo";

export interface SendEmailOptions {
  to: string;
  templateKey: string;
  variables: Record<string, string | number | undefined | null>;
  senderType?: string;
  idempotencyKey?: string;
  from?: string;
}

export interface EmailSendResult {
  success: boolean;
  provider: "resend" | "console";
  providerMessageId?: string;
  error?: string;
}

export class EmailService {
  constructor(
    private emailRepo: EmailRepository,
    private apiKey?: string,
    private fromEmail = "PropertyBikri <no-reply@propertybikri.com>"
  ) {}

  async send(options: SendEmailOptions): Promise<EmailSendResult> {
    // 1. Resolve template
    let subject = "Notification";
    let body = "";

    const dbTemplate = await this.emailRepo.getTemplateByKey(options.templateKey);
    if (dbTemplate && dbTemplate.is_active) {
      subject = interpolateTemplate(dbTemplate.subject, options.variables);
      body = interpolateTemplate(dbTemplate.body, options.variables);
    } else if (DEFAULT_TEMPLATES[options.templateKey]) {
      const def = DEFAULT_TEMPLATES[options.templateKey];
      subject = interpolateTemplate(def.subject, options.variables);
      body = interpolateTemplate(def.body, options.variables);
    } else {
      subject = String(options.variables.custom_subject || "Notification");
      body = String(options.variables.custom_body || "");
    }

    // 2. Determine provider
    if (this.apiKey && this.apiKey.startsWith("re_")) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
          },
          body: JSON.stringify({
            from: options.from || this.fromEmail,
            to: [options.to],
            subject,
            text: body,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as { id: string };
          await this.emailRepo.logSend({
            to_email: options.to,
            subject,
            body,
            sender_type: options.senderType || "system",
            status: "delivered",
            provider: "resend",
            provider_message_id: data.id,
            idempotency_key: options.idempotencyKey,
            payload: options.variables,
          });

          return { success: true, provider: "resend", providerMessageId: data.id };
        } else {
          const errText = await res.text();
          await this.emailRepo.logSend({
            to_email: options.to,
            subject,
            body,
            sender_type: options.senderType || "system",
            status: "failed",
            provider: "resend",
            error: errText,
            idempotency_key: options.idempotencyKey,
            payload: options.variables,
          });

          return { success: false, provider: "resend", error: errText };
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        await this.emailRepo.logSend({
          to_email: options.to,
          subject,
          body,
          sender_type: options.senderType || "system",
          status: "failed",
          provider: "resend",
          error: errMsg,
          idempotency_key: options.idempotencyKey,
          payload: options.variables,
        });

        return { success: false, provider: "resend", error: errMsg };
      }
    }

    // 3. Console fallback for local/preview development
    console.log(`[Email Service Console] To: ${options.to} | Subject: ${subject}\n${body}`);
    const log = await this.emailRepo.logSend({
      to_email: options.to,
      subject,
      body,
      sender_type: options.senderType || "system",
      status: "sent",
      provider: "console",
      idempotency_key: options.idempotencyKey,
      payload: options.variables,
    });

    return { success: true, provider: "console", providerMessageId: `console-${log.id}` };
  }
}
