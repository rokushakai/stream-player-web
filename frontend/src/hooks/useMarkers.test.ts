import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useMarkers } from "./useMarkers";

describe("useMarkers - US-2.1: マーカーの追加と表示", () => {
  it("初期状態ではマーカーが空である", () => {
    const { result } = renderHook(() => useMarkers());
    expect(result.current.markers).toHaveLength(0);
  });

  describe("Scenario: 再生中にマーカーを追加する", () => {
    it("Given 動画が再生位置83秒(01:23)にある When addMarkerを呼ぶ Then マーカーリストにMarker 1 (83秒)が追加される", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.addMarker(83);
      });

      expect(result.current.markers).toHaveLength(1);
      expect(result.current.markers[0]).toEqual({
        id: 1,
        name: "Marker 1",
        time: 83,
      });
    });

    it("複数マーカーを追加すると連番で名前が付与される", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.addMarker(10);
      });
      act(() => {
        result.current.addMarker(20);
      });
      act(() => {
        result.current.addMarker(30);
      });

      expect(result.current.markers).toHaveLength(3);
      expect(result.current.markers[0]?.name).toBe("Marker 1");
      expect(result.current.markers[1]?.name).toBe("Marker 2");
      expect(result.current.markers[2]?.name).toBe("Marker 3");
    });
  });
});

describe("useMarkers - US-2.2: マーカーの編集と削除", () => {
  describe("Scenario: マーカーのラベルをスワップする", () => {
    it("Given マーカー A (ID:1) と B (ID:2) が存在する When スワップする Then ラベルが交換される", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.addMarker(10);
      });
      act(() => {
        result.current.addMarker(20);
      });

      const idA = result.current.markers[0]?.id;
      const idB = result.current.markers[1]?.id;
      if (idA === undefined || idB === undefined) {
        throw new Error("Markers not found after adding");
      }

      expect(result.current.markers[0]?.name).toBe("Marker 1");
      expect(result.current.markers[1]?.name).toBe("Marker 2");

      act(() => {
        result.current.swapMarkerLabels(idA, idB);
      });

      expect(result.current.markers[0]?.name).toBe("Marker 2");
      expect(result.current.markers[1]?.name).toBe("Marker 1");
    });

    it("スワップしてもマーカーのIDとtimeは変更されない", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.addMarker(10);
      });
      act(() => {
        result.current.addMarker(20);
      });

      const idA = result.current.markers[0]?.id;
      const idB = result.current.markers[1]?.id;
      if (idA === undefined || idB === undefined) {
        throw new Error("Markers not found after adding");
      }

      act(() => {
        result.current.swapMarkerLabels(idA, idB);
      });

      expect(result.current.markers[0]?.id).toBe(idA);
      expect(result.current.markers[0]?.time).toBe(10);
      expect(result.current.markers[1]?.id).toBe(idB);
      expect(result.current.markers[1]?.time).toBe(20);
    });

    it("存在しないIDでスワップするとエラーが発生する", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.addMarker(10);
      });

      expect(() => {
        act(() => {
          result.current.swapMarkerLabels(1, 999);
        });
      }).toThrow("Cannot swap: marker 999 not found");
    });
  });

  describe("Scenario: マーカーを削除する", () => {
    it("Given マーカー A と B が存在する When A を削除する Then A が消えて B のラベルは維持される", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.addMarker(10);
      });
      act(() => {
        result.current.addMarker(20);
      });

      const idA = result.current.markers[0]?.id;
      if (idA === undefined) {
        throw new Error("Marker A not found after adding");
      }

      act(() => {
        result.current.deleteMarker(idA);
      });

      expect(result.current.markers).toHaveLength(1);
      expect(result.current.markers[0]?.name).toBe("Marker 2");
      expect(result.current.markers[0]?.time).toBe(20);
    });

    it("存在しないIDを削除しても何も起きない", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.addMarker(10);
      });

      act(() => {
        result.current.deleteMarker(999);
      });

      expect(result.current.markers).toHaveLength(1);
    });
  });

  describe("Scenario: マーカーのメモを編集する", () => {
    it("Given マーカー A が存在する When メモに 'イントロ' を設定する Then メモが保存される", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.addMarker(15.5);
      });

      const markerId = result.current.markers[0]?.id;
      if (markerId === undefined) {
        throw new Error("Marker not found after adding");
      }

      act(() => {
        result.current.updateMarkerMemo(markerId, "イントロ");
      });

      expect(result.current.markers[0]?.memo).toBe("イントロ");
    });

    it("メモを空文字に更新できる", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.addMarker(10);
      });

      const markerId = result.current.markers[0]?.id;
      if (markerId === undefined) {
        throw new Error("Marker not found after adding");
      }

      act(() => {
        result.current.updateMarkerMemo(markerId, "テスト");
      });
      act(() => {
        result.current.updateMarkerMemo(markerId, "");
      });

      expect(result.current.markers[0]?.memo).toBe("");
    });

    it("メモ更新は他のマーカーに影響しない", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.addMarker(10);
      });
      act(() => {
        result.current.addMarker(20);
      });

      const firstId = result.current.markers[0]?.id;
      if (firstId === undefined) {
        throw new Error("Marker not found after adding");
      }

      act(() => {
        result.current.updateMarkerMemo(firstId, "メモA");
      });

      expect(result.current.markers[0]?.memo).toBe("メモA");
      expect(result.current.markers[1]?.memo).toBeUndefined();
    });
  });
});
