/**
 * Email Templates & Variables
 * Follows Chapters 24, 84 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

export interface RenderedEmail {
  subject: string;
  body: string;
}

export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number | undefined | null>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = variables[key];
    return val !== undefined && val !== null ? String(val) : `{${key}}`;
  });
}

export const DEFAULT_TEMPLATES: Record<
  string,
  { subject: string; body: string; description: string; allowed_variables: string[] }
> = {
  welcome_email: {
    subject: "Welcome to PropertyBikri, {full_name}!",
    body: "Hi {full_name},\n\nWelcome to PropertyBikri. Your account ({email}) has been successfully created. You can now post property listings and manage your inquiries.\n\nRegards,\nPropertyBikri Team",
    description: "Sent upon successful user registration",
    allowed_variables: ["full_name", "email", "app_url"],
  },
  password_reset: {
    subject: "Reset your PropertyBikri password",
    body: "Hi,\n\nWe received a request to reset your password. Use the following link within 30 minutes:\n\n{reset_url}\n\nIf you did not request this, please ignore this email.\n\nPropertyBikri Security Team",
    description: "Sent when password reset is requested",
    allowed_variables: ["reset_url", "email", "expires_in"],
  },
  listing_submitted_owner: {
    subject: "Listing Submitted: {listing_title}",
    body: "Hi {owner_name},\n\nYour listing '{listing_title}' has been submitted for review. Our moderation team will review it shortly.\n\nListing ID: #{listing_id}\n\nPropertyBikri Team",
    description: "Sent to owner when listing is submitted for review",
    allowed_variables: ["owner_name", "listing_title", "listing_id"],
  },
  listing_submitted_admin: {
    subject: "New Listing Pending Review: {listing_title}",
    body: "A new listing has been submitted for review.\n\nTitle: {listing_title}\nOwner: {owner_email}\nID: #{listing_id}\n\nPlease review it in the admin panel.",
    description: "Sent to admins when a listing requires moderation",
    allowed_variables: ["listing_title", "owner_email", "listing_id", "admin_url"],
  },
  listing_approved_owner: {
    subject: "Your Listing is Live: {listing_title}",
    body: "Congratulations {owner_name},\n\nYour listing '{listing_title}' has been approved and is now live on PropertyBikri.\n\nView it here: {listing_url}\n\nPropertyBikri Team",
    description: "Sent to owner upon listing approval",
    allowed_variables: ["owner_name", "listing_title", "listing_url", "listing_id"],
  },
  listing_rejected_owner: {
    subject: "Action Required: Listing Review for {listing_title}",
    body: "Hi {owner_name},\n\nYour listing '{listing_title}' could not be approved at this time.\n\nReason: {admin_note}\n\nPlease update your listing according to the feedback and resubmit.\n\nPropertyBikri Team",
    description: "Sent to owner when listing is rejected",
    allowed_variables: ["owner_name", "listing_title", "admin_note", "edit_url"],
  },
  listing_unpublished_owner: {
    subject: "Listing Unpublished: {listing_title}",
    body: "Hi {owner_name},\n\nYour listing '{listing_title}' has been unpublished.\n\nNote: {admin_note}\n\nPropertyBikri Team",
    description: "Sent to owner when listing is unpublished",
    allowed_variables: ["owner_name", "listing_title", "admin_note"],
  },
  inquiry_received_admin: {
    subject: "New Inquiry for {listing_title}",
    body: "You received a new inquiry for '{listing_title}'.\n\nName: {visitor_name}\nPhone: {visitor_phone}\nEmail: {visitor_email}\nMessage: {message}\n\nCheck admin dashboard for details.",
    description: "Sent to admins upon new public inquiry",
    allowed_variables: ["listing_title", "visitor_name", "visitor_phone", "visitor_email", "message"],
  },
  inquiry_confirmation_visitor: {
    subject: "We received your inquiry for {listing_title}",
    body: "Hi {visitor_name},\n\nThank you for your interest in '{listing_title}'. The property team has received your details and will contact you shortly via {preferred_contact_method}.\n\nPropertyBikri Support",
    description: "Sent to inquiry submitter as confirmation",
    allowed_variables: ["visitor_name", "listing_title", "preferred_contact_method"],
  },
  admin_custom_email: {
    subject: "{custom_subject}",
    body: "{custom_body}",
    description: "Custom admin broadcast/direct email",
    allowed_variables: ["custom_subject", "custom_body", "recipient_email"],
  },
};
