import { ContentType } from "./types";

export const getContentType = (headers: Headers): ContentType => {
  const contentType = headers.get("Content-Type")?.split(";")[0];
  const [type, subtype] = contentType?.split("/") ?? [];

  if (!type && !subtype) {
    return "text";
  }
  if (type === "application" && subtype === "json") {
    return "json";
  }
  if (type === "application" && subtype === "bytes") {
    return "bytes";
  }
  if (type === "application" && subtype === "form-data") {
    return "formData";
  }
  if (type === "application" && subtype === "arraybuffer") {
    return "arrayBuffer";
  }
  if (type === "application" && subtype === "blob") {
    return "blob";
  }
  return "text";
};

export const handleError = (statusCode: number, statusText: string) => {
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
};

export const getResponseType = <T = unknown>(
  response: Response
): Promise<T> => {
  const contentType = getContentType(response.headers);

  switch (contentType) {
    case "json":
      return response.json() as Promise<T>;
    case "text":
      return response.text() as Promise<T>;
    case "blob":
      return response.blob() as Promise<T>;
    case "arrayBuffer":
      return response.arrayBuffer() as Promise<T>;
    case "bytes":
      return response.bytes() as Promise<T>;
    case "formData":
      return response.formData() as Promise<T>;
    case "xml":
    case "html":
      return response.text() as Promise<T>;
    default:
      return response.text() as Promise<T>;
  }
};
