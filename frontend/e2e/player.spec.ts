import { test, expect } from "@playwright/test";

test.describe("Epic 1: 基本再生フロー E2E", () => {
  // ==========================================================
  // URL読み込みと履歴保存
  // ==========================================================
  test.describe("URL読み込みと履歴保存", () => {
    test("YouTube URLを入力してGoを押すとタイトルが表示され、localStorageに履歴が保存される", async ({
      page,
    }) => {
      await page.goto("/");

      // URL入力欄とGoボタンが存在する
      const urlInput = page.getByTestId("url-input");
      const submitButton = page.getByTestId("url-submit");
      await expect(urlInput).toBeVisible();
      await expect(submitButton).toBeVisible();

      // YouTube URLを入力してGoを押す
      await urlInput.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      await submitButton.click();

      // タイトルが表示されるのを待つ
      const videoTitle = page.getByTestId("video-title");
      await expect(videoTitle).toBeVisible({ timeout: 15_000 });
      await expect(videoTitle).not.toHaveText("");

      // localStorageに履歴が保存されたことを確認
      const history = await page.evaluate(() =>
        localStorage.getItem("stream_player_url_history"),
      );
      expect(history).not.toBeNull();
      const parsed = JSON.parse(history as string);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].url).toBe(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );
      expect(parsed[0].title).toBeTruthy();
    });
  });

  // ==========================================================
  // キーボードショートカットの動作
  // ==========================================================
  test.describe("キーボードショートカット", () => {
    test("動画読み込み後、オーバーレイをクリックしてもフォーカスがIFrameに奪われずショートカットが効く", async ({
      page,
    }) => {
      await page.goto("/");

      // 動画を読み込む
      const urlInput = page.getByTestId("url-input");
      await urlInput.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      await page.getByTestId("url-submit").click();

      // タイトルが表示されるまで待つ（動画読み込み完了）
      await expect(page.getByTestId("video-title")).toBeVisible({
        timeout: 15_000,
      });

      // 透明オーバーレイが存在しクリック可能であることを確認
      const overlay = page.getByTestId("video-overlay");
      await expect(overlay).toBeVisible();
      await overlay.click();

      // オーバーレイクリック後、フォーカスがIFrame内に移っていないことを確認
      const activeTagAfterClick = await page.evaluate(
        () => document.activeElement?.tagName,
      );
      expect(activeTagAfterClick).not.toBe("IFRAME");

      // リスナーを設定してからSpaceキーを押し、keydownが発火することを確認
      await page.evaluate(() => {
        (window as Record<string, unknown>).__spaceKeyFired = false;
        document.addEventListener("keydown", (e: KeyboardEvent) => {
          if (e.key === " ") {
            (window as Record<string, unknown>).__spaceKeyFired = true;
          }
        });
      });

      await page.keyboard.press("Space");

      const spaceKeyFired = await page.evaluate(
        () => (window as Record<string, unknown>).__spaceKeyFired,
      );
      expect(spaceKeyFired).toBe(true);
    });
  });

  // ==========================================================
  // エラーハンドリング
  // ==========================================================
  test.describe("エラーハンドリング", () => {
    test("無効なURLを入力すると赤字のエラーメッセージが表示される", async ({
      page,
    }) => {
      await page.goto("/");

      // 無効なURLを入力
      const urlInput = page.getByTestId("url-input");
      await urlInput.fill("invalid-url");
      await page.getByTestId("url-submit").click();

      // エラーメッセージが表示される
      const errorMessage = page.getByTestId("url-error");
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).not.toHaveText("");

      // エラーメッセージが赤字（text-error クラス）であることを確認
      await expect(errorMessage).toHaveClass(/text-error/);
    });
  });
});
