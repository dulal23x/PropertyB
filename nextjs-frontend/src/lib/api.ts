const FALLBACK_API_BASE_URL = "https://api.propertybikri.com";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_PUBLIC_API_URL || FALLBACK_API_BASE_URL;
}

export function apiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  return new URL(path, baseUrl).toString();
}

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), init);
}
