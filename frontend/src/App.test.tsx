import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";

// Mock the YouTube IFrame API
const mockLoadVideo = vi.fn();
const mockTogglePlay = vi.fn();
const mockSeekTo = vi.fn();
const mockSetVolume = vi.fn();

vi.mock("./hooks/useYouTubePlayer", () => ({
  useYouTubePlayer: () => ({
    loadVideo: mockLoadVideo,
    togglePlay: mockTogglePlay,
    seekTo: mockSeekTo,
    seekRelative: vi.fn(),
    setVolume: mockSetVolume,
    setPlaybackRate: vi.fn(),
    currentTime: 0,
    duration: 0,
    playerState: -1,
    volume: 100,
    playbackRate: 1,
    isReady: true,
  }),
}));

describe("App - US-1.1: URLから動画を読み込む", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("renders the URL input, Go button, video player, and transport controls", () => {
    render(<App />);
    expect(screen.getByTestId("url-input")).toBeInTheDocument();
    expect(screen.getByTestId("url-submit")).toBeInTheDocument();
    expect(screen.getByTestId("video-player")).toBeInTheDocument();
    expect(screen.getByTestId("play-button")).toBeInTheDocument();
    expect(screen.getByTestId("time-display")).toHaveTextContent("0:00 / 0:00");
  });

  // ==========================================================
  // BDD Scenario: 有効なYouTube URLで動画を読み込む
  // ==========================================================
  describe("Scenario: 有効なYouTube URLで動画を読み込む", () => {
    it("Given ユーザーがStream Player Webを開いている When YouTube URLを入力してGoをクリック Then YouTube IFrame Playerに動画が読み込まれる", async () => {
      render(<App />);

      // When: URL入力欄に有効なYouTube URLを入力する
      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      });

      // And: Goボタンをクリックする
      fireEvent.click(screen.getByTestId("url-submit"));

      // Then: YouTube IFrame Playerに動画が読み込まれる
      await waitFor(() => {
        expect(mockLoadVideo).toHaveBeenCalledWith("dQw4w9WgXcQ");
      });

      // And: URL入力欄の下部に動画タイトル(URL)が表示される
      await waitFor(() => {
        expect(screen.getByTestId("video-title")).toBeInTheDocument();
      });
    });

    it("youtu.be 短縮URLでも動画が読み込まれる", async () => {
      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://youtu.be/dQw4w9WgXcQ" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(mockLoadVideo).toHaveBeenCalledWith("dQw4w9WgXcQ");
      });
    });

    it("embed URLでも動画が読み込まれる", async () => {
      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(mockLoadVideo).toHaveBeenCalledWith("dQw4w9WgXcQ");
      });
    });
  });

  // ==========================================================
  // BDD Scenario: 読み込み中のUI状態
  // ==========================================================
  describe("Scenario: 読み込み中のUI状態", () => {
    it("Given ユーザーがURLを入力してGoをクリック Then 完了後にGoに戻り入力欄が有効化される", async () => {
      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      // After completion: ボタンがGoに戻り、入力欄が有効化される
      await waitFor(() => {
        expect(screen.getByTestId("url-submit")).toHaveTextContent("Go");
        expect(screen.getByTestId("url-input")).not.toBeDisabled();
      });
    });

    it("バックエンドAPIフォールバック中はLoading状態が維持される", async () => {
      // Simulate slow backend response
      let resolveResponse!: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveResponse = resolve;
      });
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockReturnValue(fetchPromise);

      render(<App />);

      // non-YouTube URL triggers backend fallback
      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://example.com/some-video" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      // During loading: Loading... & disabled
      await waitFor(() => {
        expect(screen.getByTestId("url-submit")).toHaveTextContent(
          "Loading...",
        );
        expect(screen.getByTestId("url-input")).toBeDisabled();
      });

      // Resolve the fetch
      resolveResponse(
        new Response(
          JSON.stringify({
            url: "https://example.com/some-video",
            title: "Example Video",
            duration: 120,
            video_id: "abc123XYZ_0",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

      // After completion: Go & enabled
      await waitFor(() => {
        expect(screen.getByTestId("url-submit")).toHaveTextContent("Go");
        expect(screen.getByTestId("url-input")).not.toBeDisabled();
      });
    });
  });

  // ==========================================================
  // BDD Scenario: 無効なURLを入力する
  // ==========================================================
  describe("Scenario: 無効なURLを入力する", () => {
    it("Given ユーザーがStream Player Webを開いている When 無効なURLを入力してGoをクリック Then 赤字のエラーメッセージが表示される And YouTube IFrame Playerは変化しない", async () => {
      // Backend returns error for invalid URL
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ detail: "Invalid URL provided" }), {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }),
      );

      render(<App />);

      // When: 無効なURLを入力してGoをクリック
      // Note: "invalid-url" is exactly 11 chars matching video ID pattern,
      // so we use a longer string that won't match extractVideoId
      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "not-a-valid-url" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      // Then: エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByTestId("url-error")).toHaveTextContent(
          "Invalid URL provided",
        );
      });

      // And: YouTube IFrame Playerは変化しない (loadVideoが呼ばれない)
      expect(mockLoadVideo).not.toHaveBeenCalled();
    });

    it("fetchがネットワークエラーの場合もエラーメッセージが表示される", async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error"),
      );

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://unknown-site.com/video" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(screen.getByTestId("url-error")).toHaveTextContent(
          "Network error",
        );
      });
      expect(mockLoadVideo).not.toHaveBeenCalled();
    });

    it("エラー後に有効なURLで再送信するとエラーがクリアされる", async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ detail: "Invalid URL" }), {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }),
      );

      render(<App />);

      // First attempt: invalid URL → error
      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "not-a-valid-url" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(screen.getByTestId("url-error")).toBeInTheDocument();
      });

      // Second attempt: valid YouTube URL → error cleared
      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(screen.queryByTestId("url-error")).not.toBeInTheDocument();
        expect(mockLoadVideo).toHaveBeenCalledWith("dQw4w9WgXcQ");
      });
    });
  });

  // ==========================================================
  // BDD Scenario: 空のURL入力でSubmitを試みる
  // ==========================================================
  describe("Scenario: 空のURL入力でSubmitを試みる", () => {
    it("Given URL入力欄が空の状態 Then Goボタンがdisabledで表示される", () => {
      render(<App />);
      expect(screen.getByTestId("url-submit")).toBeDisabled();
    });

    it("Given URL入力欄が空の状態 Then フォームを送信しても何も起きない", () => {
      render(<App />);
      fireEvent.submit(screen.getByTestId("url-input").closest("form")!);
      expect(mockLoadVideo).not.toHaveBeenCalled();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  // ==========================================================
  // Backend fallback: video IDが抽出できない場合は /api/resolve 経由
  // ==========================================================
  describe("Backend fallback via /api/resolve", () => {
    it("YouTube以外のURLはバックエンドAPIで解決しタイトルを表示する", async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(
          JSON.stringify({
            url: "https://example.com/video",
            title: "Resolved Video Title",
            duration: 300,
            video_id: "resolvedId123",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://example.com/some-video" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      // fetch is called with correct URL
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: "https://example.com/some-video" }),
        });
      });

      // Video loaded and title displayed
      await waitFor(() => {
        expect(mockLoadVideo).toHaveBeenCalledWith("resolvedId123");
        expect(screen.getByTestId("video-title")).toHaveTextContent(
          "Resolved Video Title",
        );
      });
    });
  });
});
