import { describe, it, expect } from "vitest";
import { getContentType, handleError, getResponseType } from "./utils";

describe("getContentType", () => {
  it("should return 'json' for application/json", () => {
    const headers = new Headers({ "Content-Type": "application/json" });
    expect(getContentType(headers)).toBe("json");
  });

  it("should return 'json' for application/json with charset", () => {
    const headers = new Headers({
      "Content-Type": "application/json; charset=utf-8",
    });
    expect(getContentType(headers)).toBe("json");
  });

  it("should return 'bytes' for application/bytes", () => {
    const headers = new Headers({ "Content-Type": "application/bytes" });
    expect(getContentType(headers)).toBe("bytes");
  });

  it("should return 'formData' for application/form-data", () => {
    const headers = new Headers({ "Content-Type": "application/form-data" });
    expect(getContentType(headers)).toBe("formData");
  });

  it("should return 'arrayBuffer' for application/arraybuffer", () => {
    const headers = new Headers({
      "Content-Type": "application/arraybuffer",
    });
    expect(getContentType(headers)).toBe("arrayBuffer");
  });

  it("should return 'blob' for application/blob", () => {
    const headers = new Headers({ "Content-Type": "application/blob" });
    expect(getContentType(headers)).toBe("blob");
  });

  it("should return 'text' for text/plain", () => {
    const headers = new Headers({ "Content-Type": "text/plain" });
    expect(getContentType(headers)).toBe("text");
  });

  it("should return 'text' for text/html", () => {
    const headers = new Headers({ "Content-Type": "text/html" });
    expect(getContentType(headers)).toBe("text");
  });

  it("should return 'text' when Content-Type is missing", () => {
    const headers = new Headers();
    expect(getContentType(headers)).toBe("text");
  });

  it("should return 'text' for unknown content types", () => {
    const headers = new Headers({ "Content-Type": "application/unknown" });
    expect(getContentType(headers)).toBe("text");
  });
});

describe("handleError", () => {
  it("should throw client error for 400 status code", () => {
    expect(() => handleError(400, "Bad Request")).toThrow(
      "Client error: [400] (Bad Request)"
    );
  });

  it("should throw client error for 404 status code", () => {
    expect(() => handleError(404, "Not Found")).toThrow(
      "Client error: [404] (Not Found)"
    );
  });

  it("should throw client error for 499 status code", () => {
    expect(() => handleError(499, "Client Closed Request")).toThrow(
      "Client error: [499] (Client Closed Request)"
    );
  });

  it("should throw server error for 500 status code", () => {
    expect(() => handleError(500, "Internal Server Error")).toThrow(
      "Server error: [500] (Internal Server Error)"
    );
  });

  it("should throw server error for 503 status code", () => {
    expect(() => handleError(503, "Service Unavailable")).toThrow(
      "Server error: [503] (Service Unavailable)"
    );
  });

  it("should throw server error for 599 status code", () => {
    expect(() => handleError(599, "Network Connect Timeout")).toThrow(
      "Server error: [599] (Network Connect Timeout)"
    );
  });

  it("should throw unknown error for 300 status code", () => {
    expect(() => handleError(300, "Multiple Choices")).toThrow(
      "Unknown error: [300] (Multiple Choices)"
    );
  });

  it("should throw unknown error for 600 status code", () => {
    expect(() => handleError(600, "Unknown")).toThrow(
      "Unknown error: [600] (Unknown)"
    );
  });

  it("should handle empty statusText", () => {
    expect(() => handleError(400, "")).toThrow("Client error: [400] ()");
  });
});

describe("getResponseType", () => {
  it("should call response.json() for json content type", async () => {
    const mockJson = { data: "test" };
    const response = new Response(JSON.stringify(mockJson), {
      headers: { "Content-Type": "application/json" },
    });

    const result = await getResponseType(response);
    expect(result).toEqual(mockJson);
  });

  it("should call response.text() for text content type", async () => {
    const mockText = "plain text";
    const response = new Response(mockText, {
      headers: { "Content-Type": "text/plain" },
    });

    const result = await getResponseType(response);
    expect(result).toBe(mockText);
  });

  it("should call response.blob() for blob content type", async () => {
    const mockBlob = new Blob(["test"], { type: "application/blob" });
    const response = new Response(mockBlob, {
      headers: { "Content-Type": "application/blob" },
    });

    const result = await getResponseType(response);
    expect(result).toBeInstanceOf(Blob);
  });

  it("should call response.arrayBuffer() for arrayBuffer content type", async () => {
    const buffer = new ArrayBuffer(8);
    const response = new Response(buffer, {
      headers: { "Content-Type": "application/arraybuffer" },
    });

    const result = await getResponseType(response);
    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it("should call response.formData() for formData content type", async () => {
    // Note: Creating a mock response that returns FormData
    // The actual Response API requires multipart/form-data, but our code checks for application/form-data
    const mockFormData = new FormData();
    mockFormData.append("key", "value");

    // Create response with application/form-data to match our getContentType logic
    const mockResponse = {
      headers: new Headers({ "Content-Type": "application/form-data" }),
      formData: async () => mockFormData,
    } as Response;

    const result = await getResponseType(mockResponse);
    expect(result).toBeInstanceOf(FormData);
  });

  it("should call response.text() for missing content type (default)", async () => {
    const mockText = "default text";
    const response = new Response(mockText);

    const result = await getResponseType(response);
    expect(result).toBe(mockText);
  });

  it("should call response.text() for unknown content type", async () => {
    const mockText = "unknown content";
    const response = new Response(mockText, {
      headers: { "Content-Type": "application/unknown" },
    });

    const result = await getResponseType(response);
    expect(result).toBe(mockText);
  });
});
