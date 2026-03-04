import { describe, it, expect } from "vitest";
import { formatTime } from "./format";

describe("formatTime", () => {
  it("formats zero seconds", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("formats seconds under a minute", () => {
    expect(formatTime(45)).toBe("0:45");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(125)).toBe("2:05");
  });

  it("formats hours", () => {
    expect(formatTime(3661)).toBe("1:01:01");
  });

  it("handles negative values", () => {
    expect(formatTime(-5)).toBe("0:00");
  });

  it("handles NaN", () => {
    expect(formatTime(NaN)).toBe("0:00");
  });

  it("handles Infinity", () => {
    expect(formatTime(Infinity)).toBe("0:00");
  });
});
