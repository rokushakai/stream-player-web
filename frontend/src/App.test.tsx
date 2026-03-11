import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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

/** Helper: route fetch calls to oEmbed or backend mocks */
function setupFetchMock(options: {
  oembedTitle?: string | null;
  backendResponse?: { status: number; body: object };
}) {
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(
    (url: string) => {
      if (url.includes("oembed")) {
        if (options.oembedTitle) {
          return Promise.resolve(
            new Response(JSON.stringify({ title: options.oembedTitle }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }
        return Promise.resolve(new Response("Not Found", { status: 404 }));
      }
      if (url === "/api/resolve" && options.backendResponse) {
        return Promise.resolve(
          new Response(JSON.stringify(options.backendResponse.body), {
            status: options.backendResponse.status,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      return Promise.reject(new Error("Unexpected fetch: " + url));
    },
  );
}

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
    it("Given ユーザーがStream Player Webを開いている When YouTube URLを入力してGoをクリック Then 動画が読み込まれタイトルが表示される", async () => {
      setupFetchMock({ oembedTitle: "Rick Astley - Never Gonna Give You Up" });

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      // Then: YouTube IFrame Playerに動画が読み込まれる
      await waitFor(() => {
        expect(mockLoadVideo).toHaveBeenCalledWith("dQw4w9WgXcQ");
      });

      // And: URL入力欄の下部に動画タイトルが表示される（URLではなくタイトル）
      await waitFor(() => {
        expect(screen.getByTestId("video-title")).toHaveTextContent(
          "Rick Astley - Never Gonna Give You Up",
        );
      });
    });

    it("youtu.be 短縮URLでも動画が読み込まれタイトルが表示される", async () => {
      setupFetchMock({ oembedTitle: "Short URL Video" });

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://youtu.be/dQw4w9WgXcQ" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(mockLoadVideo).toHaveBeenCalledWith("dQw4w9WgXcQ");
        expect(screen.getByTestId("video-title")).toHaveTextContent(
          "Short URL Video",
        );
      });
    });

    it("embed URLでも動画が読み込まれる", async () => {
      setupFetchMock({ oembedTitle: "Embed Video" });

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(mockLoadVideo).toHaveBeenCalledWith("dQw4w9WgXcQ");
      });
    });

    it("oEmbedでタイトル取得失敗時はエラーが表示されプレイヤーは変化しない", async () => {
      setupFetchMock({ oembedTitle: null });

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/watch?v=XXXXXXXXXXX" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(screen.getByTestId("url-error")).toHaveTextContent(
          "動画が見つかりませんでした",
        );
      });
      expect(mockLoadVideo).not.toHaveBeenCalled();
    });
  });

  // ==========================================================
  // BDD Scenario: 読み込み中のUI状態
  // ==========================================================
  describe("Scenario: 読み込み中のUI状態", () => {
    it("Given ユーザーがURLを入力してGoをクリック Then 完了後にGoに戻り入力欄が有効化される", async () => {
      setupFetchMock({ oembedTitle: "Test Video" });

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(screen.getByTestId("url-submit")).toHaveTextContent("Go");
        expect(screen.getByTestId("url-input")).not.toBeDisabled();
      });
    });

    it("バックエンドAPIフォールバック中はLoading状態が維持される", async () => {
      let resolveResponse!: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveResponse = resolve;
      });
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
        fetchPromise,
      );

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

    it("YouTube oEmbedフェッチ中もLoading状態が維持される", async () => {
      let resolveOembed!: (value: Response) => void;
      const oembedPromise = new Promise<Response>((resolve) => {
        resolveOembed = resolve;
      });
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
        oembedPromise,
      );

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      // During loading
      await waitFor(() => {
        expect(screen.getByTestId("url-submit")).toHaveTextContent(
          "Loading...",
        );
        expect(screen.getByTestId("url-input")).toBeDisabled();
      });

      // Resolve oEmbed
      resolveOembed(
        new Response(JSON.stringify({ title: "Test Video" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      // After completion
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
    it("URL形式でない文字列を入力するとバリデーションエラーが表示されプレイヤーは変化しない", async () => {
      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "not-a-valid-url" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      // Then: エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByTestId("url-error")).toHaveTextContent(
          "有効なURLを入力してください",
        );
      });

      // And: YouTube IFrame Playerは変化しない
      expect(mockLoadVideo).not.toHaveBeenCalled();
      // And: fetchも呼ばれない（バリデーションで弾かれる）
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("バックエンドがエラーを返した場合もエラーメッセージが表示される", async () => {
      setupFetchMock({
        backendResponse: { status: 422, body: { detail: "Invalid URL provided" } },
      });

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://invalid-site.example/foo" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(screen.getByTestId("url-error")).toHaveTextContent(
          "Invalid URL provided",
        );
      });
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
      render(<App />);

      // First attempt: invalid text → validation error
      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "not-a-valid-url" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(screen.getByTestId("url-error")).toBeInTheDocument();
      });

      // Second attempt: valid YouTube URL → success
      setupFetchMock({ oembedTitle: "Recovery Video" });

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
      setupFetchMock({
        backendResponse: {
          status: 200,
          body: {
            url: "https://example.com/video",
            title: "Resolved Video Title",
            duration: 300,
            video_id: "resolvedId123",
          },
        },
      });

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://example.com/some-video" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: "https://example.com/some-video" }),
        });
      });

      await waitFor(() => {
        expect(mockLoadVideo).toHaveBeenCalledWith("resolvedId123");
        expect(screen.getByTestId("video-title")).toHaveTextContent(
          "Resolved Video Title",
        );
      });
    });
  });

  // ==========================================================
  // BDD Scenario: 動画読み込み成功時に履歴が保存される (US-1.2)
  // ==========================================================
  describe("Scenario: 動画読み込み成功時に履歴が保存される (US-1.2)", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("有効なYouTube URLで動画を読み込むとlocalStorageに履歴が保存される", async () => {
      setupFetchMock({ oembedTitle: "Saved Video Title" });

      render(<App />);

      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      });
      fireEvent.click(screen.getByTestId("url-submit"));

      await waitFor(() => {
        expect(mockLoadVideo).toHaveBeenCalledWith("dQw4w9WgXcQ");
      });

      const stored = JSON.parse(
        localStorage.getItem("stream_player_url_history")!,
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].url).toBe(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );
      expect(stored[0].title).toBe("Saved Video Title");
    });

    it("履歴から選択すると動画の読み込みが開始される", async () => {
      localStorage.setItem(
        "stream_player_url_history",
        JSON.stringify([
          { url: "https://www.youtube.com/watch?v=aaaaaaaaaaa", title: "History 1" },
          { url: "https://www.youtube.com/watch?v=bbbbbbbbbbb", title: "History 2" },
        ]),
      );

      setupFetchMock({ oembedTitle: "History 2" });

      render(<App />);

      // Open dropdown
      fireEvent.focus(screen.getByTestId("url-input"));
      expect(screen.getByTestId("url-history-dropdown")).toBeInTheDocument();

      // Select second item (mouseDown triggers onMouseDown handler)
      const items = screen.getAllByTestId("url-history-item");
      await act(async () => {
        fireEvent.mouseDown(items[1]!);
      });

      await waitFor(() => {
        expect(mockLoadVideo).toHaveBeenCalledWith("bbbbbbbbbbb");
      });
    });
  });

  // ==========================================================
  // BDD Scenario: フルスクリーン表示 (US-1.4)
  // ==========================================================
  describe("Scenario: フルスクリーン表示 (US-1.4)", () => {
    it("Given 通常表示 Then すべてのUI要素が表示されている", () => {
      render(<App />);
      expect(screen.getByTestId("url-input")).toBeInTheDocument();
      expect(screen.getByTestId("video-player")).toBeInTheDocument();
      expect(screen.getByTestId("play-button")).toBeInTheDocument();
      expect(screen.getByTestId("resize-sash")).toBeInTheDocument();
      expect(screen.getByTestId("bottom-panels")).toBeInTheDocument();
    });

    let fullscreenElement: Element | null = null;

    beforeEach(() => {
      fullscreenElement = null;
      Object.defineProperty(document, "fullscreenElement", {
        get: () => fullscreenElement,
        configurable: true,
      });
    });

    function enterFullscreen() {
      act(() => {
        fullscreenElement = document.createElement("div");
        document.dispatchEvent(new Event("fullscreenchange"));
      });
    }

    function exitFullscreen() {
      act(() => {
        fullscreenElement = null;
        document.dispatchEvent(new Event("fullscreenchange"));
      });
    }

    it("Given フルスクリーン状態 Then 動画以外のUI要素が非表示になる", () => {
      render(<App />);

      enterFullscreen();

      // Video player should still be visible
      expect(screen.getByTestId("video-player")).toBeInTheDocument();

      // Other UI elements should be hidden
      expect(screen.queryByTestId("url-input")).not.toBeInTheDocument();
      expect(screen.queryByTestId("play-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("resize-sash")).not.toBeInTheDocument();
      expect(screen.queryByTestId("bottom-panels")).not.toBeInTheDocument();
    });

    it("Given フルスクリーン状態 When Escで解除 Then 元のレイアウトに復元される", () => {
      render(<App />);

      enterFullscreen();
      expect(screen.queryByTestId("url-input")).not.toBeInTheDocument();

      exitFullscreen();

      // All elements should be restored
      expect(screen.getByTestId("url-input")).toBeInTheDocument();
      expect(screen.getByTestId("play-button")).toBeInTheDocument();
      expect(screen.getByTestId("resize-sash")).toBeInTheDocument();
      expect(screen.getByTestId("bottom-panels")).toBeInTheDocument();
    });
  });
});
