import { useEffect } from "react";
import { PlayerState } from "../types/youtube";

const FORM_ELEMENTS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

interface UseKeyboardShortcutsOptions {
  togglePlay: () => void;
  seekRelative: (delta: number) => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  volume: number;
  duration: number;
  playerState: PlayerState;
}

export function useKeyboardShortcuts({
  togglePlay,
  seekRelative,
  seekTo,
  setVolume,
  volume,
  duration,
  playerState,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip when focus is on form elements
      const target = e.target as HTMLElement;
      if (FORM_ELEMENTS.has(target.tagName)) return;

      switch (e.key) {
        // Play/Pause toggle
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;

        // Seek backward 10s
        case "j":
          e.preventDefault();
          seekRelative(-10);
          break;

        // Seek forward 10s
        case "l":
          e.preventDefault();
          seekRelative(10);
          break;

        // Arrow seek (5s default, 1s with Shift)
        case "ArrowLeft":
          e.preventDefault();
          seekRelative(e.shiftKey ? -1 : -5);
          break;

        case "ArrowRight":
          e.preventDefault();
          seekRelative(e.shiftKey ? 1 : 5);
          break;

        // Volume
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(100, volume + 5));
          break;

        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 5));
          break;

        // Percentage jump (0-9)
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault();
          if (duration > 0) {
            seekTo((Number(e.key) / 10) * duration);
          }
          break;

        // Frame step (while paused)
        case ",":
          e.preventDefault();
          if (playerState === PlayerState.PAUSED) {
            seekRelative(-1 / 30);
          }
          break;

        case ".":
          e.preventDefault();
          if (playerState === PlayerState.PAUSED) {
            seekRelative(1 / 30);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, seekRelative, seekTo, setVolume, volume, duration, playerState]);
}
