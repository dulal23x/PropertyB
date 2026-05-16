import { apiFetch } from "@/lib/api";
import { authHeaders } from "@/lib/auth";

export type AdminStats = {
  pending_review?: number;
  approved?: number;
  rejected?: number;
  unpublished?: number;
  archived?: number;
  draft?: number;
  new_inquiries?: number;
  total_users?: number;
  emails_sent_today?: number;
};

export type AdminListing = {
  id: number;
  owner_user_id?: number;
  owner_email?: string | null;
  slug: string;
  title: string;
  description?: string;
  status: string;
  listing_purpose: string;
  property_type: string;
  city?: string | null;
  area_name?: string | null;
  display_address?: string | null;
  price_amount?: number | null;
  price_label?: string | null;
  price_visibility?: string;
  currency?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size_value?: number | null;
  size_unit?: string | null;
  land_size_value?: number | null;
  land_size_unit?: string | null;
  admin_note?: string | null;
  cover_image_url?: string | null;
  image_count?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminListResponse<T> = {
  items: T[];
  page?: number;
  page_size?: number;
  total?: number;
};

export type AdminListingDetail = {
  listing: AdminListing;
  owner: { id: number; email: string; full_name?: string | null } | null;
  images: Array<{ id: number; public_url: string; is_cover: boolean }>;
  audit_logs: Array<{
    id: number;
    action: string;
    from_status?: string | null;
    to_status?: string | null;
    note?: string | null;
    created_at?: string;
  }>;
};

export type AdminInquiry = {
  id: number;
  listing_id: number;
  listing_title?: string | null;
  listing_slug?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  preferred_contact_method?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type AdminUser = {
  id: number;
  email: string;
  role: string;
  full_name?: string | null;
  is_active: boolean;
  created_at?: string;
};

export type EmailLog = {
  id: number;
  to_email: string;
  subject: string;
  status: string;
  sender_type: string;
  created_at?: string;
};

export type EmailTemplate = {
  id: number;
  template_key: string;
  subject: string;
  body: string;
  updated_at?: string;
};

export type EmailServerStats = {
  provider?: string;
  emails_sent_today?: number;
};

async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Admin request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchAdminStats() {
  return adminJson<AdminStats>("/admin/properties/stats");
}

export function fetchRecentAuditLogs() {
  return adminJson<any[]>("/admin/properties/audit-logs/recent");
}

export function fetchAdminListings(query = "status=pending_review") {
  return adminJson<AdminListResponse<AdminListing>>(`/admin/properties?${query}`);
}

export function fetchAdminListing(id: number) {
  return adminJson<AdminListingDetail>(`/admin/properties/${id}`);
}

export function approveListing(id: number) {
  return adminJson<{ id: number; status: string }>(`/admin/properties/${id}/approve`, { method: "POST" });
}

export function rejectListing(id: number, note: string) {
  return adminJson<{ id: number; status: string }>(`/admin/properties/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}

export function unpublishListing(id: number, note?: string) {
  return adminJson<{ id: number; status: string }>(`/admin/properties/${id}/unpublish`, {
    method: "POST",
    body: JSON.stringify({ note: note || null }),
  });
}

export function archiveListing(id: number) {
  return adminJson<{ id: number; status: string }>(`/admin/properties/${id}/archive`, { method: "POST" });
}

export function bulkApproveListings(ids: number[]) {
  return adminJson<{ count: number }>("/admin/properties/bulk-approve", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function bulkRejectListings(ids: number[], note: string) {
  return adminJson<{ count: number }>("/admin/properties/bulk-reject", {
    method: "POST",
    body: JSON.stringify({ ids, note }),
  });
}

export function bulkUnpublishListings(ids: number[], note?: string) {
  return adminJson<{ count: number }>("/admin/properties/bulk-unpublish", {
    method: "POST",
    body: JSON.stringify({ ids, note: note || null }),
  });
}

export function bulkArchiveListings(ids: number[]) {
  return adminJson<{ count: number }>("/admin/properties/bulk-archive", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function fetchAdminInquiries(query = "status=new") {
  return adminJson<AdminListResponse<AdminInquiry>>(`/admin/inquiries?${query}`);
}

export function updateInquiryStatus(id: number, status: "contacted" | "closed" | "spam") {
  return adminJson<AdminInquiry>(`/admin/inquiries/${id}/mark-${status}`, { method: "POST" });
}

export function fetchAdminUsers() {
  return adminJson<{ items: AdminUser[] }>("/admin/users");
}

export function updateAdminUser(id: number, payload: Partial<Pick<AdminUser, "full_name" | "role" | "is_active">>) {
  return adminJson<AdminUser>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchEmailLogs() {
  return adminJson<{ items: EmailLog[] }>("/admin/email/logs");
}

export function fetchEmailLogContent(id: number) {
  return adminJson<{ subject: string; body: string }>(`/admin/email/logs/${id}/content`);
}

export function fetchEmailTemplates() {
  return adminJson<{ items: EmailTemplate[] }>("/admin/email/templates");
}

export function updateEmailTemplate(id: number, subject: string, body: string) {
  return adminJson<EmailTemplate>(`/admin/email/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify({ subject, body }),
  });
}

export function fetchEmailServerStats() {
  return adminJson<EmailServerStats>("/admin/email/server-stats");
}

export function sendAdminEmail(payload: { to_email: string; subject: string; body: string; sender_type?: string }) {
  return adminJson<{ id: number; status: string }>("/admin/email/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
