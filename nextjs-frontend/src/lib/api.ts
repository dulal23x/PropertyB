const FALLBACK_API_BASE_URL = "http://127.0.0.1:8090";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_BASE_URL;
}

export function apiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  return new URL(path, baseUrl).toString();
}

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), init);
}
