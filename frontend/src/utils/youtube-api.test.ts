import { describe, it, expect } from "vitest";
import { extractVideoId } from "./youtube-api";

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

  it("extracts bare video ID", () => {
    expect(extractVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for invalid URL", () => {
    expect(extractVideoId("not-a-youtube-url")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractVideoId("")).toBeNull();
  });
});
