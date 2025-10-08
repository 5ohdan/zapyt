import type { FetchOptions } from "./types";

export class FetchClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    if (URL.canParse(baseUrl)) {
      this.baseUrl = baseUrl;
    } else {
      throw new Error("Invalid base URL");
    }
  }

  async get<T = unknown>(url: string, options?: FetchOptions) {
    const { headers } = options ?? {};
    const fetchUrl = this.baseUrl + url;
    return fetch(fetchUrl, { headers, method: "GET" }).then((response) => {
      if (!response.ok) {
        this.handleError(response.status, response.statusText);
      }
      return response.json() as Promise<T>;
    });
  }

  async post<T = unknown, K = unknown>(
    url: string,
    data: K,
    options?: FetchOptions
  ) {
    const fetchUrl = this.baseUrl + url;
    const { headers } = options ?? {};
    return fetch(fetchUrl, {
      headers,
      method: "POST",
      body: JSON.stringify(data), // TODO: use superjson?
    }).then((response) => {
      if (!response.ok) {
        this.handleError(response.status, response.statusText);
      }
      return response.json() as Promise<T>;
    });
  }

  async put<T = unknown, K = unknown>(
    url: string,
    data: K,
    options?: FetchOptions
  ) {
    const fetchUrl = this.baseUrl + url;
    const { headers } = options ?? {};
    return fetch(fetchUrl, {
      headers,
      method: "PUT",
      body: JSON.stringify(data), // TODO: use superjson?
    }).then((response) => {
      if (!response.ok) {
        this.handleError(response.status, response.statusText);
      }
      return response.json() as Promise<T>;
    });
  }

  async delete<T = unknown>(url: string, options?: FetchOptions) {
    const { headers } = options ?? {};
    const fetchUrl = this.baseUrl + url;
    return fetch(fetchUrl, {
      headers,
      method: "DELETE",
    }).then((response) => {
      if (!response.ok) {
        this.handleError(response.status, response.statusText);
      }
      return response.json() as Promise<T>;
    });
  }

  private handleError(statusCode: number, statusText: string) {
    if (statusCode >= 400 && statusCode <= 499) {
      throw new Error(
        `Client error: [${statusCode}] (${statusText ?? "Unknown"})`
      );
    }
    if (statusCode >= 500 && statusCode <= 599) {
      throw new Error(
        `Server error: [${statusCode}] (${statusText ?? "Unknown"})`
      );
    }
    throw new Error(
      `Unknown error: [${statusCode}] (${statusText ?? "Unknown"})`
    );
  }
}
