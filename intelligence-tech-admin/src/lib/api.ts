"use client";

/** Browser: same-origin `/api` (rewrites to the web app). Server: full base URL if ever used during SSR. */
function apiOrigin(): string {
  if (typeof window !== "undefined") return "";
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export async function apiFetch<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const base = apiOrigin();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
      authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const maybeError =
      json && typeof json === "object" && "error" in json
        ? (json as { error?: unknown }).error
        : null;
    const msg =
      typeof maybeError === "string"
        ? maybeError
        : `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

export async function apiUpload(
  token: string,
  file: File,
  bucket: string = "blog-images",
): Promise<{ url: string; path: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("bucket", bucket);

  const res = await fetch(`${window.location.origin}/api_proxy/admin/upload`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: fd,
  });

  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "error" in json
        ? String((json as { error: unknown }).error)
        : "Upload failed";
    throw new Error(msg);
  }

  const url =
    json && typeof json === "object" && "url" in json
      ? String((json as { url: unknown }).url)
      : null;
  const path =
    json && typeof json === "object" && "path" in json
      ? String((json as { path: unknown }).path)
      : "";
  if (!url) throw new Error("Upload failed");

  return { url, path };
}
