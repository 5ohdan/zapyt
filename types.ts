export type FetchOptions = {
  headers?: Record<string, any>;
};

export type FetchResponse<T> = {
  data: T;
  status: number;
  statusText: string;
};

export interface FetchClientInterface {
  get<T = unknown>(
    url: string,
    options?: FetchOptions
  ): Promise<FetchResponse<T>>;
  post<T = unknown, K = unknown>(
    url: string,
    payload: K,
    options?: FetchOptions
  ): Promise<FetchResponse<T>>;
  put<T = unknown, K = unknown>(
    url: string,
    payload: K,
    options?: FetchOptions
  ): Promise<FetchResponse<T>>;
  delete<T = unknown>(
    url: string,
    options?: FetchOptions
  ): Promise<FetchResponse<T>>;
}
