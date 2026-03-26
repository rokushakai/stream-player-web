import { useCallback, useState } from "react";

export interface Marker {
  id: number;
  name: string;
  time: number;
  memo?: string;
}

interface UseMarkersReturn {
  markers: Marker[];
  addMarker: (time: number) => void;
  updateMarkerMemo: (id: number, memo: string) => void;
  deleteMarker: (id: number) => void;
  swapMarkerLabels: (idA: number, idB: number) => void;
}

export function useMarkers(): UseMarkersReturn {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [nextId, setNextId] = useState(1);

  const addMarker = useCallback(
    (time: number) => {
      setMarkers((prev) => [
        ...prev,
        { id: nextId, name: `Marker ${nextId}`, time },
      ]);
      setNextId((prev) => prev + 1);
    },
    [nextId],
  );

  const updateMarkerMemo = useCallback((id: number, memo: string) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === id ? { ...marker, memo } : marker,
      ),
    );
  }, []);

  const deleteMarker = useCallback((id: number) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
  }, []);

  const swapMarkerLabels = useCallback((idA: number, idB: number) => {
    setMarkers((prev) => {
      const markerA = prev.find((m) => m.id === idA);
      const markerB = prev.find((m) => m.id === idB);
      if (!markerA || !markerB) {
        throw new Error(
          `Cannot swap: marker ${!markerA ? idA : idB} not found`,
        );
      }
      return prev.map((marker) => {
        if (marker.id === idA) {
          return { ...marker, name: markerB.name };
        }
        if (marker.id === idB) {
          return { ...marker, name: markerA.name };
        }
        return marker;
      });
    });
  }, []);

  return { markers, addMarker, updateMarkerMemo, deleteMarker, swapMarkerLabels };
}
