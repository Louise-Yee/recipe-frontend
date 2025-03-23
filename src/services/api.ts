/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/api.ts
const BASE_URL =
  "https://us-central1-cloud-recipe-coursework.cloudfunctions.net/api";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

export async function fetchApi<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An unknown error occurred" }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// Example service functions
export const userService = {
  getUsers: () => fetchApi<any[]>("/users"),
  getUserById: (id: string) => fetchApi<any>(`/users/${id}`),
  createUser: (userData: any) =>
    fetchApi<any>("/users", {
      method: "POST",
      body: userData,
    }),
  // Add more methods as needed
};
