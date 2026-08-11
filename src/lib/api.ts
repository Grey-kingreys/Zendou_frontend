const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

/**
 * Thrown for any non-2xx response from the API. `status` lets callers branch
 * on specific HTTP codes (401, 409, ...) and `message` is safe to show to
 * the user when the API already returns a human-readable message.
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function extractMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
    if (Array.isArray(message) && message.length > 0) {
      return message.join(" ");
    }
  }
  return fallback;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    // Network failure (server unreachable, CORS, offline, ...). Re-thrown as
    // a plain Error so callers can tell it apart from an ApiError and show
    // the "impossible de joindre le serveur" message.
    throw new Error("network-error");
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // Response had no JSON body — fall back to a generic message below.
    }
    throw new ApiError(
      response.status,
      extractMessage(body, `Erreur ${response.status}`)
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
