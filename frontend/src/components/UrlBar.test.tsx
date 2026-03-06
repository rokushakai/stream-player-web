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

  // BDD: Scenario - 空のURL入力でSubmitを試みる
  describe("Scenario: 空のURL入力でSubmitを試みる", () => {
    it("Given URL入力欄が空の状態 Then Goボタンがdisabledで表示される", () => {
      render(<UrlBar {...defaultProps} />);
      expect(screen.getByTestId("url-submit")).toBeDisabled();
      expect(screen.getByTestId("url-submit")).toHaveTextContent("Go");
    });

    it("Given URL入力欄が空の状態 Then フォームを送信しても何も起きない", () => {
      const onSubmit = vi.fn();
      render(<UrlBar {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.submit(screen.getByTestId("url-input").closest("form")!);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("空白のみの入力でもGoボタンはdisabledのまま", () => {
      render(<UrlBar {...defaultProps} />);
      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "   " },
      });
      expect(screen.getByTestId("url-submit")).toBeDisabled();
    });
  });

  // BDD: Scenario - 有効なYouTube URLで動画を読み込む (UrlBar部分)
  describe("Scenario: URLを入力してGoボタンで送信する", () => {
    it("URLを入力するとGoボタンが有効化される", () => {
      render(<UrlBar {...defaultProps} />);
      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      });
      expect(screen.getByTestId("url-submit")).not.toBeDisabled();
    });

    it("GoボタンクリックでonSubmitがトリミングされたURLで呼ばれる", () => {
      const onSubmit = vi.fn();
      render(<UrlBar {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "  https://www.youtube.com/watch?v=dQw4w9WgXcQ  " },
      });
      fireEvent.click(screen.getByTestId("url-submit"));
      expect(onSubmit).toHaveBeenCalledWith(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );
    });

    it("Enterキーでフォームが送信される", () => {
      const onSubmit = vi.fn();
      render(<UrlBar {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.change(screen.getByTestId("url-input"), {
        target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      });
      fireEvent.submit(screen.getByTestId("url-input").closest("form")!);
      expect(onSubmit).toHaveBeenCalledWith(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );
    });
  });

  // BDD: Scenario - 読み込み中のUI状態
  describe("Scenario: 読み込み中のUI状態", () => {
    it("isLoading=true の時、GoボタンがLoading...に変わる", () => {
      render(<UrlBar {...defaultProps} isLoading={true} />);
      expect(screen.getByTestId("url-submit")).toHaveTextContent("Loading...");
    });

    it("isLoading=true の時、URL入力欄がdisabledになる", () => {
      render(<UrlBar {...defaultProps} isLoading={true} />);
      expect(screen.getByTestId("url-input")).toBeDisabled();
    });

    it("isLoading=true の時、Goボタンもdisabledになる", () => {
      render(<UrlBar {...defaultProps} isLoading={true} />);
      expect(screen.getByTestId("url-submit")).toBeDisabled();
    });

    it("isLoading=false に戻るとGoボタンがGoに戻り入力欄が有効化される", () => {
      const { rerender } = render(
        <UrlBar {...defaultProps} isLoading={true} />,
      );
      expect(screen.getByTestId("url-submit")).toHaveTextContent("Loading...");
      expect(screen.getByTestId("url-input")).toBeDisabled();

      rerender(<UrlBar {...defaultProps} isLoading={false} />);
      expect(screen.getByTestId("url-submit")).toHaveTextContent("Go");
      expect(screen.getByTestId("url-input")).not.toBeDisabled();
    });
  });

  // BDD: Scenario - 読み込み成功時、タイトル表示
  describe("Scenario: 読み込み成功時の表示", () => {
    it("titleが渡されると動画タイトルが表示される", () => {
      render(<UrlBar {...defaultProps} title="Test Video Title" />);
      expect(screen.getByTestId("video-title")).toHaveTextContent(
        "Test Video Title",
      );
    });

    it("titleがnullの時はタイトルが表示されない", () => {
      render(<UrlBar {...defaultProps} title={null} />);
      expect(screen.queryByTestId("video-title")).not.toBeInTheDocument();
    });
  });

  // BDD: Scenario - 無効なURLを入力する (エラー表示)
  describe("Scenario: エラー表示", () => {
    it("errorが渡されるとエラーメッセージが表示される", () => {
      render(<UrlBar {...defaultProps} error="Invalid URL" />);
      expect(screen.getByTestId("url-error")).toHaveTextContent("Invalid URL");
    });

    it("エラーメッセージはtext-errorクラス（赤字）で表示される", () => {
      render(<UrlBar {...defaultProps} error="Something went wrong" />);
      const errorEl = screen.getByTestId("url-error");
      expect(errorEl.className).toContain("text-error");
    });

    it("errorがnullの時はエラーメッセージが表示されない", () => {
      render(<UrlBar {...defaultProps} error={null} />);
      expect(screen.queryByTestId("url-error")).not.toBeInTheDocument();
    });
  });
});
