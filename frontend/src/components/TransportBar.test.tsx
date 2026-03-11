import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TransportBar } from "./TransportBar";
import { PlayerState } from "../types/youtube";

describe("TransportBar", () => {
  const defaultProps = {
    currentTime: 0,
    duration: 0,
    playerState: PlayerState.UNSTARTED,
    volume: 100,
    playbackRate: 1,
    onTogglePlay: vi.fn(),
    onSeek: vi.fn(),
    onVolumeChange: vi.fn(),
    onToggleFullscreen: vi.fn(),
    isFullscreen: false,
  };

  it("renders play button with play icon when paused", () => {
    render(<TransportBar {...defaultProps} />);
    expect(screen.getByTestId("play-button")).toHaveTextContent("▶");
  });

  it("renders pause icon when playing", () => {
    render(
      <TransportBar {...defaultProps} playerState={PlayerState.PLAYING} />,
    );
    expect(screen.getByTestId("play-button")).toHaveTextContent("⏸");
  });

  it("displays formatted time", () => {
    render(
      <TransportBar {...defaultProps} currentTime={65} duration={180} />,
    );
    expect(screen.getByTestId("time-display")).toHaveTextContent(
      "1:05 / 3:00",
    );
  });

  it("calls onTogglePlay when play button is clicked", () => {
    const onTogglePlay = vi.fn();
    render(<TransportBar {...defaultProps} onTogglePlay={onTogglePlay} />);
    fireEvent.click(screen.getByTestId("play-button"));
    expect(onTogglePlay).toHaveBeenCalled();
  });

  it("shows playback rate when not 1x", () => {
    render(<TransportBar {...defaultProps} playbackRate={0.75} />);
    expect(screen.getByTestId("playback-rate")).toHaveTextContent("0.75x");
  });

  it("hides playback rate when 1x", () => {
    render(<TransportBar {...defaultProps} playbackRate={1} />);
    expect(screen.queryByTestId("playback-rate")).not.toBeInTheDocument();
  });
});
