import type {
  FetchClientInterface,
  FetchOptions,
  FetchResponse,
} from "./types";

export class FetchClient implements FetchClientInterface {
  private baseUrl: string;

  constructor(baseUrl: string) {
    if (URL.canParse(baseUrl)) {
      this.baseUrl = baseUrl;
    } else {
      throw new Error("Invalid base URL");
    }
  }

  async get<T = unknown>(
    url: string,
    options?: FetchOptions
  ): Promise<FetchResponse<T>> {
    const { headers } = options ?? {};

    const fetchUrl = this.baseUrl + url;
    const response = await fetch(fetchUrl, { headers, method: "GET" });

    const { status, statusText, ok } = response;
    if (!ok) {
      this.handleError(status, statusText);
    }

    const data = await response.json();
    return { data, status, statusText };
  }

  async post<T = unknown, K = unknown>(
    url: string,
    payload: K,
    options?: FetchOptions
  ): Promise<FetchResponse<T>> {
    const fetchUrl = this.baseUrl + url;
    const { headers } = options ?? {};

    const body = JSON.stringify(payload); // TODO: use superjson?
    const response = await fetch(fetchUrl, {
      headers,
      method: "POST",
      body,
    });

    const { status, statusText, ok } = response;
    if (!ok) {
      this.handleError(status, statusText);
    }

    const data = await response.json();
    return { data, status, statusText };
  }

  async put<T = unknown, K = unknown>(
    url: string,
    payload: K,
    options?: FetchOptions
  ): Promise<FetchResponse<T>> {
    const fetchUrl = this.baseUrl + url;
    const { headers } = options ?? {};

    const body = JSON.stringify(payload); // TODO: use superjson?

    const response = await fetch(fetchUrl, {
      headers,
      method: "PUT",
      body,
    });

    const { status, statusText, ok } = response;
    if (!ok) {
      this.handleError(status, statusText);
    }

    const data = await response.json();
    return { data, status, statusText };
  }

  async delete<T = unknown>(
    url: string,
    options?: FetchOptions
  ): Promise<FetchResponse<T>> {
    const { headers } = options ?? {};
    const fetchUrl = this.baseUrl + url;
    const response = await fetch(fetchUrl, {
      headers,
      method: "DELETE",
    });
    const { status, statusText, ok } = response;
    if (!ok) {
      this.handleError(status, statusText);
    }

    const data = await response.json();
    return { data, status, statusText };
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
