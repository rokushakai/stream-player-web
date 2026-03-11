import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useUrlHistory } from "./useUrlHistory";

const STORAGE_KEY = "stream_player_url_history";

describe("useUrlHistory - US-1.2: URL入力履歴", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ==========================================================
  // BDD Scenario: 動画読み込み成功時に履歴が保存される
  // ==========================================================
  describe("Scenario: 動画読み込み成功時に履歴が保存される", () => {
    it("Given ユーザーがStream Player Webを開いている When 有効なURLで動画を読み込む Then localStorageに履歴が保存される", () => {
      const { result } = renderHook(() => useUrlHistory());

      act(() => {
        result.current.addEntry("https://www.youtube.com/watch?v=abc123", "Test Video");
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0]).toEqual({
        url: "https://www.youtube.com/watch?v=abc123",
        title: "Test Video",
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toHaveLength(1);
      expect(stored[0].url).toBe("https://www.youtube.com/watch?v=abc123");
      expect(stored[0].title).toBe("Test Video");
    });
  });

  // ==========================================================
  // BDD Scenario: 履歴はリロード後も保持される
  // ==========================================================
  describe("Scenario: 履歴はリロード後も保持される", () => {
    it("Given 動画Aを読み込み履歴に保存された状態 When ブラウザをリロードする Then 履歴が表示される", () => {
      // Simulate a previous session
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([{ url: "https://youtube.com/watch?v=A", title: "Video A" }]),
      );

      const { result } = renderHook(() => useUrlHistory());

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0]).toEqual({
        url: "https://youtube.com/watch?v=A",
        title: "Video A",
      });
    });
  });

  // ==========================================================
  // BDD Scenario: 同一URLの重複は古い方が削除される
  // ==========================================================
  describe("Scenario: 同一URLの重複は古い方が削除される", () => {
    it("Given 履歴にURL 'X' が既に存在する When 再度URL 'X' で動画を読み込む Then 履歴に1件のみ存在し先頭に表示される", () => {
      const { result } = renderHook(() => useUrlHistory());

      act(() => {
        result.current.addEntry("https://youtube.com/watch?v=X", "Video X");
      });
      act(() => {
        result.current.addEntry("https://youtube.com/watch?v=Y", "Video Y");
      });
      act(() => {
        result.current.addEntry("https://youtube.com/watch?v=X", "Video X Updated");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[0]).toEqual({
        url: "https://youtube.com/watch?v=X",
        title: "Video X Updated",
      });
      expect(result.current.history[1]).toEqual({
        url: "https://youtube.com/watch?v=Y",
        title: "Video Y",
      });
    });
  });

  // ==========================================================
  // 最大50件
  // ==========================================================
  describe("最大件数の制限", () => {
    it("履歴は最大50件まで保持され、超過分は古いものから削除される", () => {
      const { result } = renderHook(() => useUrlHistory());

      act(() => {
        for (let i = 0; i < 55; i++) {
          result.current.addEntry(`https://example.com/${i}`, `Video ${i}`);
        }
      });

      expect(result.current.history).toHaveLength(50);
      // Most recent (54) should be first
      expect(result.current.history[0].url).toBe("https://example.com/54");
      // Oldest kept (5) should be last
      expect(result.current.history[49].url).toBe("https://example.com/5");
    });
  });

  // ==========================================================
  // 不正なlocalStorageデータへの耐性
  // ==========================================================
  describe("不正データへの耐性", () => {
    it("localStorageに不正なJSONがある場合は空配列を返す", () => {
      localStorage.setItem(STORAGE_KEY, "not-json");
      const { result } = renderHook(() => useUrlHistory());
      expect(result.current.history).toEqual([]);
    });

    it("localStorageに配列でないデータがある場合は空配列を返す", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: "bar" }));
      const { result } = renderHook(() => useUrlHistory());
      expect(result.current.history).toEqual([]);
    });
  });
});
