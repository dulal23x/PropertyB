const FALLBACK_PROPERTY_IMAGE = "/assets/placeholders/property-placeholder.svg";

function isLocalBackendHost(hostname: string, port?: string) {
  return (
    (hostname === "localhost" || hostname === "127.0.0.1") &&
    (port === "" || port === "8090" || port === "3010")
  );
}

export function getSafePropertyImageSrc(src?: string | null) {
  if (!src) return FALLBACK_PROPERTY_IMAGE;

  if (src.startsWith("/")) {
    return src;
  }

  try {
    const url = new URL(src);
    if ((url.protocol === "http:" || url.protocol === "https:") && isLocalBackendHost(url.hostname, url.port)) {
      return src;
    }
  } catch {
    // Fall through to the local placeholder.
  }

  return FALLBACK_PROPERTY_IMAGE;
}

