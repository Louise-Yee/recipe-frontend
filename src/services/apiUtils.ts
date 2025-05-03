// src/services/apiUtils.ts
import { auth } from "@/config/firebase";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface ApiOptions extends RequestInit {
  useAuth?: boolean;
  refreshOnUnauthorized?: boolean;
  params?: Record<string, unknown>;
}

/**
 * Enhanced fetch function with automatic auth token handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    useAuth = true,
    refreshOnUnauthorized = true,
    headers = {},
    params,
    ...fetchOptions
  } = options;

  // Prepare headers with content type if not a GET request
  // Use Record<string, string> to properly type the headers object
  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (
    fetchOptions.method &&
    fetchOptions.method !== "GET" &&
    !requestHeaders["Content-Type"] &&
    !(fetchOptions.body instanceof FormData)
  ) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Add auth token if required and available
  if (useAuth && auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken(true);
      requestHeaders["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Failed to get auth token:", error);
    }
  }

  // Build request URL
  let url = endpoint.startsWith("http") ? endpoint : `${apiUrl}${endpoint}`;

  // Add query parameters if present
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}${queryString}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
      credentials: "include", // Always include credentials for cookies
    });

    // Handle unauthorized errors (token expired)
    if (response.status === 401 && refreshOnUnauthorized) {
      if (auth?.currentUser) {
        try {
          // Force refresh the token and try again
          await auth.currentUser.getIdToken(true);

          // Retry the request once with refreshOnUnauthorized=false to prevent infinite loops
          return apiFetch(endpoint, {
            ...options,
            refreshOnUnauthorized: false,
          });
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw new Error("Authentication expired. Please log in again.");
        }
      }
    }

    // Handle HTTP error statuses
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: `;
      try {
        const errorData = await response.json();
        errorMessage += errorData.error || errorData.message || "Unknown error";
        throw new Error(errorMessage);
      } catch {
        // If we can't parse the error as JSON, use the status text
        throw new Error(
          `${errorMessage}${response.statusText || "Unknown error"}`
        );
      }
    }

    // If no content, return empty object
    if (response.status === 204) {
      return {} as T;
    }

    // For image uploads or binary responses
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    } else if (contentType?.includes("image/")) {
      return (await response.blob()) as unknown as T;
    }

    // Default to JSON
    return await response.json();
  } catch (error) {
    // Enhance network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Network error: Could not connect to the API. Please check your internet connection."
      );
    }
    throw error;
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown, source: string): string {
  // Log the error for debugging
  console.error(`[API Error] ${source}:`, error);

  // Return a user-friendly message
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred. Please try again.";
}
