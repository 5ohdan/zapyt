import type {
  FetchClientInterface,
  FetchOptions,
  FetchResponse,
} from "./types";
import { handleError, getResponseType } from "./utils";

export class FetchClient implements FetchClientInterface {
  private baseUrl: string;

  constructor(baseUrl: string) {
    if (!URL.canParse(baseUrl)) {
      throw new Error("Invalid base URL");
    }
    this.baseUrl = baseUrl;
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
      handleError(status, statusText);
    }

    return {
      data: () => getResponseType<T>(response),
      status,
      statusText,
    };
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
      handleError(status, statusText);
    }

    return {
      data: () => getResponseType<T>(response),
      status,
      statusText,
    };
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
      handleError(status, statusText);
    }

    return {
      data: () => getResponseType<T>(response),
      status,
      statusText,
    };
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
      handleError(status, statusText);
    }

    return {
      data: () => getResponseType<T>(response),
      status,
      statusText,
    };
  }
}
