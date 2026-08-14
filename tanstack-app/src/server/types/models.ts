export type UserRole = "client" | "admin";

export interface DbUser {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  full_name: string | null;
  is_active: number; // 0 | 1
  auth_version: number;
  password_reset_required: number; // 0 | 1
  created_at: string;
  updated_at: string;
}

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "unpublished"
  | "archived";

export type ListingPurpose = "sale" | "rent";
export type PropertyType = "apartment" | "house" | "land" | "commercial";
export type PriceVisibility = "show_price" | "call_for_price" | "contact_for_price";

export interface DbListing {
  id: number;
  owner_user_id: number;
  title: string;
  slug: string;
  description: string;
  listing_purpose: ListingPurpose;
  property_type: PropertyType;
  property_subtype: string | null;
  status: ListingStatus;
  price_amount: number | null;
  price_label: string | null;
  price_visibility: PriceVisibility;
  currency: string;
  price_period: string | null;
  division: string | null;
  district: string | null;
  city: string;
  area_name: string;
  address_line: string | null;
  display_address: string;
  map_lat: number | null;
  map_lng: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  parking_spaces: number | null;
  floor_number: number | null;
  total_floors: number | null;
  size_value: number | null;
  size_unit: string | null;
  land_size_value: number | null;
  land_size_unit: string | null;
  plot_type: string | null;
  facing: string | null;
  handover_status: string | null;
  handover_date: string | null;
  furnishing_status: string | null;
  amenities_json: string | null;
  nearby_places_json: string | null;
  owner_note: string | null;
  admin_note: string | null;
  featured: number;
  approved_by_user_id: number | null;
  approved_at: string | null;
  published_at: string | null;
  rejected_at: string | null;
  unpublished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbImage {
  id: number;
  listing_id: number;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: number;
  uploaded_by_user_id: number | null;
  created_at: string;
}

export interface DbInquiry {
  id: number;
  listing_id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  preferred_contact_method: "phone" | "whatsapp" | "email";
  source_page: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  status: "new" | "contacted" | "closed" | "spam";
  assigned_admin_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbAuditLog {
  id: number;
  listing_id: number;
  actor_user_id: number | null;
  action: string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  metadata_json: string | null;
  created_at: string;
}

export interface DbEmailTemplate {
  id: number;
  template_key: string;
  subject: string;
  body: string;
  description: string | null;
  allowed_variables_json: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DbEmailLog {
  id: number;
  sender_type: string;
  to_email: string;
  subject: string;
  body: string;
  status: string;
  provider: string;
  provider_message_id: string | null;
  idempotency_key: string | null;
  attempt_count: number;
  error: string | null;
  payload_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSiteSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  description: string | null;
  is_public: number;
  created_at: string;
  updated_at: string;
}
