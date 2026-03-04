import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UrlBar } from "./UrlBar";

describe("UrlBar", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    isLoading: false,
    error: null,
    title: null,
  };

  it("renders input and button", () => {
    render(<UrlBar {...defaultProps} />);
    expect(screen.getByTestId("url-input")).toBeInTheDocument();
    expect(screen.getByTestId("url-submit")).toBeInTheDocument();
  });

  it("disables button when input is empty", () => {
    render(<UrlBar {...defaultProps} />);
    expect(screen.getByTestId("url-submit")).toBeDisabled();
  });

  it("enables button when URL is entered", () => {
    render(<UrlBar {...defaultProps} />);
    fireEvent.change(screen.getByTestId("url-input"), {
      target: { value: "https://youtube.com/watch?v=test" },
    });
    expect(screen.getByTestId("url-submit")).not.toBeDisabled();
  });

  it("calls onSubmit when form is submitted", () => {
    const onSubmit = vi.fn();
    render(<UrlBar {...defaultProps} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByTestId("url-input"), {
      target: { value: "https://youtube.com/watch?v=test" },
    });
    fireEvent.click(screen.getByTestId("url-submit"));
    expect(onSubmit).toHaveBeenCalledWith("https://youtube.com/watch?v=test");
  });

  it("shows loading state", () => {
    render(<UrlBar {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId("url-submit")).toHaveTextContent("Loading...");
    expect(screen.getByTestId("url-input")).toBeDisabled();
  });

  it("displays video title", () => {
    render(<UrlBar {...defaultProps} title="Test Video Title" />);
    expect(screen.getByTestId("video-title")).toHaveTextContent(
      "Test Video Title",
    );
  });

  it("displays error message", () => {
    render(<UrlBar {...defaultProps} error="Something went wrong" />);
    expect(screen.getByTestId("url-error")).toHaveTextContent(
      "Something went wrong",
    );
  });
});
