import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the URL input", () => {
    render(<App />);
    expect(screen.getByTestId("url-input")).toBeInTheDocument();
  });

  it("renders the Go button", () => {
    render(<App />);
    expect(screen.getByTestId("url-submit")).toBeInTheDocument();
  });

  it("renders the video player container", () => {
    render(<App />);
    expect(screen.getByTestId("video-player")).toBeInTheDocument();
  });

  it("renders the play button", () => {
    render(<App />);
    expect(screen.getByTestId("play-button")).toBeInTheDocument();
  });

  it("renders time display with initial zeros", () => {
    render(<App />);
    expect(screen.getByTestId("time-display")).toHaveTextContent("0:00 / 0:00");
  });
});
