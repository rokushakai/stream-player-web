import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { PlayerState } from "../types/youtube";

function fireKey(key: string, options: Partial<KeyboardEventInit> = {}) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...options }));
}

describe("useKeyboardShortcuts - US-1.3: 基本再生操作", () => {
  const mockTogglePlay = vi.fn();
  const mockSeekRelative = vi.fn();
  const mockSeekTo = vi.fn();
  const mockSetVolume = vi.fn();

  const defaultOptions = {
    togglePlay: mockTogglePlay,
    seekRelative: mockSeekRelative,
    seekTo: mockSeekTo,
    setVolume: mockSetVolume,
    volume: 50,
    duration: 200,
    playerState: PlayerState.PLAYING,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================
  // BDD Scenario: Spaceキーで再生/一時停止をトグルする
  // ==========================================================
  describe("Scenario: Spaceキーで再生/一時停止をトグルする", () => {
    it("Given 動画が再生中 And フォーム要素にフォーカスがない When Spaceキーを押す Then togglePlayが呼ばれる", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      fireKey(" ");
      expect(mockTogglePlay).toHaveBeenCalledOnce();
    });

    it("Kキーでも再生/一時停止をトグルする", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      fireKey("k");
      expect(mockTogglePlay).toHaveBeenCalledOnce();
    });
  });

  // ==========================================================
  // BDD Scenario: Jキーで10秒戻る
  // ==========================================================
  describe("Scenario: Jキーで10秒戻る", () => {
    it("Given 動画が再生位置30秒にある When Jキーを押す Then 再生位置が10秒戻る", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      fireKey("j");
      expect(mockSeekRelative).toHaveBeenCalledWith(-10);
    });
  });

  // ==========================================================
  // BDD Scenario: Lキーで10秒進む
  // ==========================================================
  describe("Scenario: Lキーで10秒進む", () => {
    it("Given 動画が再生中 When Lキーを押す Then 再生位置が10秒進む", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      fireKey("l");
      expect(mockSeekRelative).toHaveBeenCalledWith(10);
    });
  });

  // ==========================================================
  // BDD Scenario: ArrowLeft/Rightで5秒シーク
  // ==========================================================
  describe("Scenario: 矢印キーでシーク操作", () => {
    it("ArrowLeftで5秒戻る", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      fireKey("ArrowLeft");
      expect(mockSeekRelative).toHaveBeenCalledWith(-5);
    });

    it("ArrowRightで5秒進む", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      fireKey("ArrowRight");
      expect(mockSeekRelative).toHaveBeenCalledWith(5);
    });

    it("Shift+ArrowLeftで1秒戻る", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      fireKey("ArrowLeft", { shiftKey: true });
      expect(mockSeekRelative).toHaveBeenCalledWith(-1);
    });

    it("Shift+ArrowRightで1秒進む", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      fireKey("ArrowRight", { shiftKey: true });
      expect(mockSeekRelative).toHaveBeenCalledWith(1);
    });
  });

  // ==========================================================
  // BDD Scenario: 矢印上下で音量調整
  // ==========================================================
  describe("Scenario: 矢印上下で音量調整", () => {
    it("ArrowUpで音量+5", () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, volume: 50 }));
      fireKey("ArrowUp");
      expect(mockSetVolume).toHaveBeenCalledWith(55);
    });

    it("ArrowDownで音量-5", () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, volume: 50 }));
      fireKey("ArrowDown");
      expect(mockSetVolume).toHaveBeenCalledWith(45);
    });

    it("音量が100を超えない", () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, volume: 98 }));
      fireKey("ArrowUp");
      expect(mockSetVolume).toHaveBeenCalledWith(100);
    });

    it("音量が0を下回らない", () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, volume: 2 }));
      fireKey("ArrowDown");
      expect(mockSetVolume).toHaveBeenCalledWith(0);
    });
  });

  // ==========================================================
  // BDD Scenario: 数字キーでパーセンテージジャンプ
  // ==========================================================
  describe("Scenario: 数字キーでパーセンテージジャンプ", () => {
    it("Given 動画の長さが200秒 When 5キーを押す Then 再生位置が100秒（50%）に移動する", () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, duration: 200 }));
      fireKey("5");
      expect(mockSeekTo).toHaveBeenCalledWith(100);
    });

    it("0キーで先頭（0%）にジャンプ", () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, duration: 200 }));
      fireKey("0");
      expect(mockSeekTo).toHaveBeenCalledWith(0);
    });

    it("9キーで90%地点にジャンプ", () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, duration: 200 }));
      fireKey("9");
      expect(mockSeekTo).toHaveBeenCalledWith(180);
    });

    it("durationが0の場合はseekToが呼ばれない", () => {
      renderHook(() => useKeyboardShortcuts({ ...defaultOptions, duration: 0 }));
      fireKey("5");
      expect(mockSeekTo).not.toHaveBeenCalled();
    });
  });

  // ==========================================================
  // BDD Scenario: Comma/Periodでフレーム単位移動（一時停止中のみ）
  // ==========================================================
  describe("Scenario: Comma/Periodでフレーム単位移動", () => {
    it("一時停止中にCommaキーで1フレーム戻る", () => {
      renderHook(() =>
        useKeyboardShortcuts({ ...defaultOptions, playerState: PlayerState.PAUSED }),
      );
      fireKey(",");
      expect(mockSeekRelative).toHaveBeenCalledWith(-1 / 30);
    });

    it("一時停止中にPeriodキーで1フレーム進む", () => {
      renderHook(() =>
        useKeyboardShortcuts({ ...defaultOptions, playerState: PlayerState.PAUSED }),
      );
      fireKey(".");
      expect(mockSeekRelative).toHaveBeenCalledWith(1 / 30);
    });

    it("再生中はCommaキーでフレーム移動しない", () => {
      renderHook(() =>
        useKeyboardShortcuts({ ...defaultOptions, playerState: PlayerState.PLAYING }),
      );
      fireKey(",");
      expect(mockSeekRelative).not.toHaveBeenCalled();
    });

    it("再生中はPeriodキーでフレーム移動しない", () => {
      renderHook(() =>
        useKeyboardShortcuts({ ...defaultOptions, playerState: PlayerState.PLAYING }),
      );
      fireKey(".");
      expect(mockSeekRelative).not.toHaveBeenCalled();
    });
  });

  // ==========================================================
  // BDD Scenario: 入力欄フォーカス中はショートカット無効
  // ==========================================================
  describe("Scenario: 入力欄フォーカス中はショートカット無効", () => {
    it("Given URL入力欄にフォーカスがある When Spaceキーを押す Then 再生状態は変化しない", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));

      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      input.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      expect(mockTogglePlay).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it("textarea要素にフォーカスがある場合もショートカット無効", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));

      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.focus();

      textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "j", bubbles: true }));
      expect(mockSeekRelative).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it("select要素にフォーカスがある場合もショートカット無効", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));

      const select = document.createElement("select");
      document.body.appendChild(select);
      select.focus();

      select.dispatchEvent(new KeyboardEvent("keydown", { key: "k", bubbles: true }));
      expect(mockTogglePlay).not.toHaveBeenCalled();

      document.body.removeChild(select);
    });
  });

  // ==========================================================
  // BDD Scenario: Mキーでマーカーを追加する (US-2.1)
  // ==========================================================
  describe("Scenario: Mキーでマーカーを追加する", () => {
    it("Mキーを押すとaddMarkerが呼ばれる", () => {
      const mockAddMarker = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts({ ...defaultOptions, addMarker: mockAddMarker }),
      );
      fireKey("m");
      expect(mockAddMarker).toHaveBeenCalledOnce();
    });

    it("addMarkerが未設定でもエラーにならない", () => {
      renderHook(() => useKeyboardShortcuts(defaultOptions));
      expect(() => fireKey("m")).not.toThrow();
    });
  });
});
