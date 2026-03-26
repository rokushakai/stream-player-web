import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MarkersPanel } from "./MarkersPanel";
import type { Marker } from "../hooks/useMarkers";

const defaultProps = {
  onAddMarker: vi.fn(),
  onSeekToMarker: vi.fn(),
  onUpdateMemo: vi.fn(),
  onDeleteMarker: vi.fn(),
  onSwapMarkerLabels: vi.fn(),
};

function renderPanel(markers: Marker[], overrides = {}) {
  const props = { ...defaultProps, ...overrides, markers };
  // Reset mocks before each render
  for (const fn of Object.values(defaultProps)) {
    fn.mockClear();
  }
  return render(<MarkersPanel {...props} />);
}

describe("MarkersPanel - US-2.1: マーカーの追加と表示", () => {
  describe("Scenario: 再生中にマーカーを追加する", () => {
    it("「+ Add」ボタンが表示される", () => {
      renderPanel([]);
      expect(screen.getByTestId("add-marker-button")).toBeInTheDocument();
      expect(screen.getByTestId("add-marker-button")).toHaveTextContent("+ Add");
    });

    it("「+ Add」ボタンをクリックするとonAddMarkerが呼ばれる", () => {
      renderPanel([]);
      fireEvent.click(screen.getByTestId("add-marker-button"));
      expect(defaultProps.onAddMarker).toHaveBeenCalledOnce();
    });

    it("マーカーが追加されるとリストに名前とタイムスタンプが表示される", () => {
      const markers: Marker[] = [{ id: 1, name: "Marker 1", time: 83 }];
      renderPanel(markers);

      const item = screen.getByTestId("marker-item");
      expect(item).toHaveTextContent("Marker 1");
      expect(item).toHaveTextContent("1:23");
    });

    it("マーカーがない場合は「No markers yet」が表示される", () => {
      renderPanel([]);
      expect(screen.getByText("No markers yet")).toBeInTheDocument();
    });
  });

  describe("Scenario: マーカーをクリックしてシークする", () => {
    it("Given マーカーリストにMarker 1 (01:23)が存在する When クリックする Then onSeekToMarkerが83秒で呼ばれる", () => {
      const markers: Marker[] = [{ id: 1, name: "Marker 1", time: 83 }];
      renderPanel(markers);

      fireEvent.click(screen.getByTestId("marker-item"));
      expect(defaultProps.onSeekToMarker).toHaveBeenCalledWith(83);
    });

    it("複数マーカーがある場合、各マーカーをクリックするとそれぞれのタイムスタンプでシークされる", () => {
      const markers: Marker[] = [
        { id: 1, name: "Marker 1", time: 83 },
        { id: 2, name: "Marker 2", time: 150 },
      ];
      renderPanel(markers);

      const items = screen.getAllByTestId("marker-item");
      expect(items).toHaveLength(2);

      fireEvent.click(items[1]!);
      expect(defaultProps.onSeekToMarker).toHaveBeenCalledWith(150);
    });
  });
});

describe("MarkersPanel - US-2.2: マーカーの編集と削除", () => {
  describe("Scenario: マーカーのメモを編集する", () => {
    it("Given マーカー A が存在する When メモ欄に 'イントロ' と入力する Then onUpdateMemoが呼ばれる", () => {
      const markers: Marker[] = [{ id: 1, name: "Marker 1", time: 15.5 }];
      renderPanel(markers);

      const memoInput = screen.getByTestId("marker-memo-1");
      fireEvent.change(memoInput, { target: { value: "イントロ" } });
      expect(defaultProps.onUpdateMemo).toHaveBeenCalledWith(1, "イントロ");
    });

    it("メモ欄からフォーカスを外すとonUpdateMemoが呼ばれる（blur保存）", () => {
      const markers: Marker[] = [{ id: 1, name: "Marker 1", time: 15.5, memo: "イントロ" }];
      renderPanel(markers);

      const memoInput = screen.getByTestId("marker-memo-1");
      fireEvent.blur(memoInput);
      expect(defaultProps.onUpdateMemo).toHaveBeenCalledWith(1, "イントロ");
    });

    it("メモの初期値が正しく表示される", () => {
      const markers: Marker[] = [{ id: 1, name: "Marker 1", time: 10, memo: "テスト" }];
      renderPanel(markers);

      const memoInput = screen.getByTestId("marker-memo-1") as HTMLInputElement;
      expect(memoInput.value).toBe("テスト");
    });

    it("メモが未設定の場合、空のプレースホルダーが表示される", () => {
      const markers: Marker[] = [{ id: 1, name: "Marker 1", time: 10 }];
      renderPanel(markers);

      const memoInput = screen.getByTestId("marker-memo-1") as HTMLInputElement;
      expect(memoInput.value).toBe("");
      expect(memoInput.placeholder).toBe("memo...");
    });
  });

  describe("Scenario: マーカーを削除する", () => {
    it("Given マーカー A が存在する When × ボタンをクリックする Then onDeleteMarkerが呼ばれる", () => {
      const markers: Marker[] = [{ id: 1, name: "Marker 1", time: 10 }];
      renderPanel(markers);

      const deleteBtn = screen.getByTestId("delete-marker-1");
      expect(deleteBtn).toHaveAttribute("aria-label", "Delete Marker 1");
      fireEvent.click(deleteBtn);
      expect(defaultProps.onDeleteMarker).toHaveBeenCalledWith(1);
    });

    it("複数マーカーがある場合、正しいIDで削除が呼ばれる", () => {
      const markers: Marker[] = [
        { id: 1, name: "Marker 1", time: 10 },
        { id: 2, name: "Marker 2", time: 20 },
      ];
      renderPanel(markers);

      fireEvent.click(screen.getByTestId("delete-marker-2"));
      expect(defaultProps.onDeleteMarker).toHaveBeenCalledWith(2);
    });
  });

  describe("Scenario: マーカーのラベルをスワップする", () => {
    it("マーカーが2つ以上ある場合、Swapボタンが表示される", () => {
      const markers: Marker[] = [
        { id: 1, name: "Marker 1", time: 10 },
        { id: 2, name: "Marker 2", time: 20 },
      ];
      renderPanel(markers);

      expect(screen.getByTestId("swap-button")).toBeInTheDocument();
    });

    it("マーカーが1つ以下の場合、Swapボタンは非表示", () => {
      const markers: Marker[] = [{ id: 1, name: "Marker 1", time: 10 }];
      renderPanel(markers);

      expect(screen.queryByTestId("swap-button")).not.toBeInTheDocument();
    });

    it("初期状態ではSwapボタンがdisabled", () => {
      const markers: Marker[] = [
        { id: 1, name: "Marker 1", time: 10 },
        { id: 2, name: "Marker 2", time: 20 },
      ];
      renderPanel(markers);

      expect(screen.getByTestId("swap-button")).toBeDisabled();
    });

    it("2つのマーカーを選択するとSwapボタンが有効化される", () => {
      const markers: Marker[] = [
        { id: 1, name: "Marker 1", time: 10 },
        { id: 2, name: "Marker 2", time: 20 },
      ];
      renderPanel(markers);

      fireEvent.click(screen.getByTestId("swap-select-1"));
      fireEvent.click(screen.getByTestId("swap-select-2"));

      expect(screen.getByTestId("swap-button")).not.toBeDisabled();
    });

    it("2つ選択してSwapボタンをクリックするとonSwapMarkerLabelsが呼ばれる", () => {
      const markers: Marker[] = [
        { id: 1, name: "Marker 1", time: 10 },
        { id: 2, name: "Marker 2", time: 20 },
      ];
      renderPanel(markers);

      fireEvent.click(screen.getByTestId("swap-select-1"));
      fireEvent.click(screen.getByTestId("swap-select-2"));
      fireEvent.click(screen.getByTestId("swap-button"));

      expect(defaultProps.onSwapMarkerLabels).toHaveBeenCalledWith(1, 2);
    });

    it("選択済みマーカーを再クリックすると選択解除される", () => {
      const markers: Marker[] = [
        { id: 1, name: "Marker 1", time: 10 },
        { id: 2, name: "Marker 2", time: 20 },
      ];
      renderPanel(markers);

      fireEvent.click(screen.getByTestId("swap-select-1"));
      fireEvent.click(screen.getByTestId("swap-select-1")); // deselect

      expect(screen.getByTestId("swap-button")).toBeDisabled();
    });

    it("スワップ選択ボタンに適切なaria-labelがある", () => {
      const markers: Marker[] = [
        { id: 1, name: "Marker 1", time: 10 },
        { id: 2, name: "Marker 2", time: 20 },
      ];
      renderPanel(markers);

      const btn = screen.getByTestId("swap-select-1");
      expect(btn).toHaveAttribute("aria-label", "Select Marker 1 for swap");

      fireEvent.click(btn);
      expect(btn).toHaveAttribute("aria-label", "Deselect Marker 1 for swap");
    });
  });
});
