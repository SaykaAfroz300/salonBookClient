const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

let cachedToken: { value: string; expiresAt: number } | null = null;

export function clearAuthTokenCache(): void {
  cachedToken = null;
}

export async function getBackendToken(forceRefresh = false): Promise<string | null> {
  if (
    !forceRefresh &&
    cachedToken &&
    Date.now() < cachedToken.expiresAt - 60_000
  ) {
    return cachedToken.value;
  }

  try {
    const res = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      cachedToken = null;
      return null;
    }

    const data = await res.json();
    if (data?.token) {
      cachedToken = {
        value: data.token,
        expiresAt: Date.now() + 90 * 60 * 1000,
      };
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

export async function apiFetch<T = any>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, auth = false, headers: customHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (auth) {
    const token = await getBackendToken();
    if (!token) {
      throw new ApiError("Please sign in to continue.", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  let response = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  // Retry once with a fresh token if 401 on an authenticated call
  if (auth && response.status === 401) {
    const freshToken = await getBackendToken(true);
    if (freshToken) {
      headers.Authorization = `Bearer ${freshToken}`;
      response = await fetch(url, {
        ...rest,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
    }
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      payload?.message || `Request failed with status ${response.status}`,
      response.status,
      payload?.code
    );
  }

  return payload as T;
}

export async function uploadImageToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) {
    throw new Error(data?.message || "Image upload failed.");
  }

  return data.url;
}
