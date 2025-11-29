export function normalizeImageUrl(url?: string | null, id?: number): string | undefined {
  const cfg = String(import.meta.env.VITE_API_IMAGE_ENDPOINT || "http://localhost:17002");
  const cfgNoSlash = cfg.replace(/\/$/, "");

  // Derive an origin to prefix root-relative urls ("/api/..")
  let origin = "";
  try {
    origin = new URL(cfg).origin; // e.g. http://localhost:17000
  } catch {
    // fallback to window origin (useful in dev when env isn't set)
    origin = typeof window !== "undefined" ? window.location.origin : cfgNoSlash.replace(/\/.*$/, "");
  }

  // Helper to build absolute path relative to api base if needed
  const apiBase = (() => {
    // prefer a base that ends with /api or not — we use cfgNoSlash directly
    return cfgNoSlash;
  })();

  if (url && typeof url === "string" && url.trim() !== "") {
    // absolute already
    if (/^https?:\/\//i.test(url)) return url;
    // root-relative: prefix origin
    if (url.startsWith("/")) {
      // ensure no double slashes
      return `${origin.replace(/\/$/, "")}${url}`;
    }
    // relative without leading slash: treat relative to configured API base
    return `${apiBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  }

  // fallback to the raw image endpoint by id
  if (typeof id === "number" && !Number.isNaN(id)) {
    // choose an endpoint path consistent with backend (here we use /api/v1/images/{id}/raw if backend uses /raw)
    // try keep apiBase trimmed and append known images path:
    const imagesPath = "/api/v1/images";
    const base = apiBase.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
    return `${base}${imagesPath}/${id}/raw`.replace(/\/{2,}/g, "/").replace("http:/", "http://").replace("https:/", "https://");
  }

  return undefined;
}