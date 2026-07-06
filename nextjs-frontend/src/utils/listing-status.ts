export const LISTING_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Published",
  rejected: "Rejected",
  unpublished: "Unpublished",
  archived: "Archived",
};

export const NEXT_ACTION_LABELS: Record<string, string> = {
  submit_for_review: "Submit for review",
  wait_for_admin_review: "Waiting for admin review",
  view_public_or_edit_and_resubmit: "View public listing or edit and resubmit",
  fix_and_resubmit: "Fix and resubmit",
  edit_and_resubmit: "Edit and resubmit",
  view_only: "View only",
};

export function listingStatusLabel(status?: string) {
  return LISTING_STATUS_LABELS[status || "draft"] || "Needs review";
}

export function nextActionLabel(action?: string) {
  return NEXT_ACTION_LABELS[action || ""] || "Review listing";
}
