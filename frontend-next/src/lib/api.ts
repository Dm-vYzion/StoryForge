const DEFAULT_API_BASE = "http://localhost:4000";

export function getApiBaseUrl() {
  // In the future we can read from NEXT_PUBLIC_API_BASE_URL
  // For now, keep it simple.
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return DEFAULT_API_BASE;
}

export function apiUrl(path: string) {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}