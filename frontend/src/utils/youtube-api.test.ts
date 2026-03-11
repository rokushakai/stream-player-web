import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractVideoId, isValidUrl, fetchYouTubeTitle } from "./youtube-api";

describe("extractVideoId", () => {
  it("extracts from standard watch URL", () => {
    expect(
      extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("extracts from short URL", () => {
    expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("extracts from embed URL", () => {
    expect(
      extractVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("extracts from URL with extra params", () => {
    expect(
      extractVideoId(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10&feature=share",
      ),
    ).toBe("dQw4w9WgXcQ");
  });

  it("returns null for bare video ID (no longer supported)", () => {
    expect(extractVideoId("dQw4w9WgXcQ")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(extractVideoId("not-a-youtube-url")).toBeNull();
  });

  it("returns null for 11-char non-URL like 'invalid-url'", () => {
    expect(extractVideoId("invalid-url")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractVideoId("")).toBeNull();
  });
});

describe("isValidUrl", () => {
  it("returns true for https URL", () => {
    expect(isValidUrl("https://www.youtube.com/watch?v=test")).toBe(true);
  });

  it("returns true for http URL", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isValidUrl("invalid-url")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("returns false for bare video ID", () => {
    expect(isValidUrl("dQw4w9WgXcQ")).toBe(false);
  });
});

describe("fetchYouTubeTitle", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("returns title when oEmbed responds successfully", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ title: "Test Video Title" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const title = await fetchYouTubeTitle("dQw4w9WgXcQ");
    expect(title).toBe("Test Video Title");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("oembed"),
    );
  });

  it("returns null when oEmbed responds with error", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response("Not Found", { status: 404 }),
    );

    const title = await fetchYouTubeTitle("invalidId1234");
    expect(title).toBeNull();
  });
});
