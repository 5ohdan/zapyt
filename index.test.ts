import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FetchClient } from "./index";

describe("FetchClient", () => {
  describe("constructor", () => {
    it("should create an instance with valid base URL", () => {
      const client = new FetchClient("https://api.example.com");
      expect(client).toBeInstanceOf(FetchClient);
    });

    it("should throw error for invalid base URL", () => {
      expect(() => new FetchClient("not-a-valid-url")).toThrow(
        "Invalid base URL"
      );
    });

    it("should throw error for empty string", () => {
      expect(() => new FetchClient("")).toThrow("Invalid base URL");
    });
  });

  describe("get", () => {
    let client: FetchClient;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      client = new FetchClient("https://api.example.com");
      fetchMock = vi.fn();
      globalThis.fetch = fetchMock;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should make GET request with correct URL", async () => {
      const mockData = { id: 1, name: "Test" };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(mockData), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.get("/users/1");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        {
          headers: undefined,
          method: "GET",
        }
      );
    });

    it("should return response with correct status and data for JSON", async () => {
      const mockData = { id: 1, name: "Test" };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(mockData), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        })
      );

      const response = await client.get<typeof mockData>("/users/1");

      expect(response.status).toBe(200);
      expect(response.statusText).toBe("OK");
      expect(await response.data()).toEqual(mockData);
    });

    it("should make GET request with custom headers", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.get("/users/1", {
        headers: { Authorization: "Bearer token123" },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        {
          headers: { Authorization: "Bearer token123" },
          method: "GET",
        }
      );
    });

    it("should handle text response", async () => {
      const mockText = "Plain text response";
      fetchMock.mockResolvedValue(
        new Response(mockText, {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "text/plain" },
        })
      );

      const response = await client.get<string>("/text");
      expect(await response.data()).toBe(mockText);
    });

    it("should throw error for 404 status", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 404,
          statusText: "Not Found",
        })
      );

      await expect(client.get("/users/999")).rejects.toThrow(
        "Client error: [404] (Not Found)"
      );
    });

    it("should throw error for 400 status", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 400,
          statusText: "Bad Request",
        })
      );

      await expect(client.get("/users")).rejects.toThrow(
        "Client error: [400] (Bad Request)"
      );
    });

    it("should throw error for 500 status", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 500,
          statusText: "Internal Server Error",
        })
      );

      await expect(client.get("/users")).rejects.toThrow(
        "Server error: [500] (Internal Server Error)"
      );
    });

    it("should handle GET request without options", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.get("/users");

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", {
        headers: undefined,
        method: "GET",
      });
    });
  });

  describe("post", () => {
    let client: FetchClient;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      client = new FetchClient("https://api.example.com");
      fetchMock = vi.fn();
      globalThis.fetch = fetchMock;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should make POST request with correct URL and payload", async () => {
      const payload = { name: "New User", email: "user@example.com" };
      const mockResponse = { id: 1, ...payload };

      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 201,
          statusText: "Created",
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.post("/users", payload);

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", {
        headers: undefined,
        method: "POST",
        body: JSON.stringify(payload),
      });
    });

    it("should return response with correct status and data", async () => {
      const payload = { name: "New User" };
      const mockResponse = { id: 1, ...payload };

      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 201,
          statusText: "Created",
          headers: { "Content-Type": "application/json" },
        })
      );

      const response = await client.post<typeof mockResponse, typeof payload>(
        "/users",
        payload
      );

      expect(response.status).toBe(201);
      expect(response.statusText).toBe("Created");
      expect(await response.data()).toEqual(mockResponse);
    });

    it("should make POST request with custom headers", async () => {
      const payload = { name: "Test" };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 201,
          statusText: "Created",
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.post("/users", payload, {
        headers: { Authorization: "Bearer token123" },
      });

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", {
        headers: { Authorization: "Bearer token123" },
        method: "POST",
        body: JSON.stringify(payload),
      });
    });

    it("should throw error for 400 status", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 400,
          statusText: "Bad Request",
        })
      );

      await expect(client.post("/users", { name: "" })).rejects.toThrow(
        "Client error: [400] (Bad Request)"
      );
    });

    it("should throw error for 500 status", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 500,
          statusText: "Internal Server Error",
        })
      );

      await expect(client.post("/users", { name: "Test" })).rejects.toThrow(
        "Server error: [500] (Internal Server Error)"
      );
    });

    it("should handle POST request without options", async () => {
      const payload = { name: "Test" };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 201,
          statusText: "Created",
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.post("/users", payload);

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", {
        headers: undefined,
        method: "POST",
        body: JSON.stringify(payload),
      });
    });

    it("should stringify complex payload objects", async () => {
      const payload = {
        user: { name: "Test", nested: { value: 123 } },
        array: [1, 2, 3],
      };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 201,
          statusText: "Created",
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.post("/data", payload);

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/data", {
        headers: undefined,
        method: "POST",
        body: JSON.stringify(payload),
      });
    });
  });

  describe("put", () => {
    let client: FetchClient;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      client = new FetchClient("https://api.example.com");
      fetchMock = vi.fn();
      globalThis.fetch = fetchMock;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should make PUT request with correct URL and payload", async () => {
      const payload = { name: "Updated User", email: "updated@example.com" };
      const mockResponse = { id: 1, ...payload };

      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.put("/users/1", payload);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        {
          headers: undefined,
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
    });

    it("should return response with correct status and data", async () => {
      const payload = { name: "Updated User" };
      const mockResponse = { id: 1, ...payload };

      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        })
      );

      const response = await client.put<typeof mockResponse, typeof payload>(
        "/users/1",
        payload
      );

      expect(response.status).toBe(200);
      expect(response.statusText).toBe("OK");
      expect(await response.data()).toEqual(mockResponse);
    });

    it("should make PUT request with custom headers", async () => {
      const payload = { name: "Test" };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.put("/users/1", payload, {
        headers: { Authorization: "Bearer token123" },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        {
          headers: { Authorization: "Bearer token123" },
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
    });

    it("should throw error for 404 status", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 404,
          statusText: "Not Found",
        })
      );

      await expect(client.put("/users/999", { name: "Test" })).rejects.toThrow(
        "Client error: [404] (Not Found)"
      );
    });

    it("should throw error for 500 status", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 500,
          statusText: "Internal Server Error",
        })
      );

      await expect(client.put("/users/1", { name: "Test" })).rejects.toThrow(
        "Server error: [500] (Internal Server Error)"
      );
    });

    it("should handle PUT request without options", async () => {
      const payload = { name: "Test" };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.put("/users/1", payload);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        {
          headers: undefined,
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
    });
  });

  describe("delete", () => {
    let client: FetchClient;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      client = new FetchClient("https://api.example.com");
      fetchMock = vi.fn();
      globalThis.fetch = fetchMock;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should make DELETE request with correct URL", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 204,
          statusText: "No Content",
        })
      );

      await client.delete("/users/1");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        {
          headers: undefined,
          method: "DELETE",
        }
      );
    });

    it("should return response with correct status", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 204,
          statusText: "No Content",
        })
      );

      const response = await client.delete("/users/1");

      expect(response.status).toBe(204);
      expect(response.statusText).toBe("No Content");
    });

    it("should handle DELETE with JSON response", async () => {
      const mockResponse = { success: true, deleted: 1 };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        })
      );

      const response = await client.delete<typeof mockResponse>("/users/1");

      expect(response.status).toBe(200);
      expect(await response.data()).toEqual(mockResponse);
    });

    it("should make DELETE request with custom headers", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 204,
          statusText: "No Content",
        })
      );

      await client.delete("/users/1", {
        headers: { Authorization: "Bearer token123" },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        {
          headers: { Authorization: "Bearer token123" },
          method: "DELETE",
        }
      );
    });

    it("should throw error for 404 status", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 404,
          statusText: "Not Found",
        })
      );

      await expect(client.delete("/users/999")).rejects.toThrow(
        "Client error: [404] (Not Found)"
      );
    });

    it("should throw error for 500 status", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 500,
          statusText: "Internal Server Error",
        })
      );

      await expect(client.delete("/users/1")).rejects.toThrow(
        "Server error: [500] (Internal Server Error)"
      );
    });

    it("should handle DELETE request without options", async () => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 204,
          statusText: "No Content",
        })
      );

      await client.delete("/users/1");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        {
          headers: undefined,
          method: "DELETE",
        }
      );
    });
  });
});
