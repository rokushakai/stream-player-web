import { useState } from "react";
import type { Marker } from "../hooks/useMarkers";
import { formatTime } from "../utils/format";

interface MarkersPanelProps {
  readonly markers: Marker[];
  readonly onAddMarker: () => void;
  readonly onSeekToMarker: (time: number) => void;
  readonly onUpdateMemo: (id: number, memo: string) => void;
  readonly onDeleteMarker: (id: number) => void;
  readonly onSwapMarkerLabels: (idA: number, idB: number) => void;
}

export function MarkersPanel({
  markers,
  onAddMarker,
  onSeekToMarker,
  onUpdateMemo,
  onDeleteMarker,
  onSwapMarkerLabels,
}: MarkersPanelProps) {
  const [swapSelection, setSwapSelection] = useState<number[]>([]);

  const toggleSwapSelection = (id: number) => {
    setSwapSelection((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }
      if (prev.length >= 2) {
        return [prev[1]!, id];
      }
      return [...prev, id];
    });
  };

  const handleSwap = () => {
    if (swapSelection.length !== 2) return;
    const idA = swapSelection[0];
    const idB = swapSelection[1];
    if (idA === undefined || idB === undefined) return;
    onSwapMarkerLabels(idA, idB);
    setSwapSelection([]);
  };

  const canSwap = swapSelection.length === 2;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Markers
        </h3>
        <div className="flex items-center gap-1">
          {markers.length >= 2 && (
            <button
              type="button"
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                canSwap
                  ? "bg-yellow-600 text-white hover:bg-yellow-500"
                  : "bg-white/10 text-text-secondary cursor-not-allowed"
              }`}
              onClick={handleSwap}
              disabled={!canSwap}
              data-testid="swap-button"
              aria-label="Swap selected marker labels"
            >
              Swap
            </button>
          )}
          <button
            type="button"
            className="px-2 py-0.5 text-xs bg-accent text-white rounded hover:bg-accent-hover transition-colors"
            onClick={onAddMarker}
            data-testid="add-marker-button"
          >
            + Add
          </button>
        </div>
      </div>

      {markers.length === 0 ? (
        <p className="text-xs text-text-secondary/60">No markers yet</p>
      ) : (
        <ul className="flex-1 overflow-y-auto space-y-0.5" data-testid="marker-list">
          {markers.map((marker) => {
            const isSelected = swapSelection.includes(marker.id);
            return (
              <li
                key={marker.id}
                className={`rounded ${isSelected ? "ring-1 ring-yellow-500" : ""}`}
              >
                <div className="flex items-center gap-1 px-1 py-1">
                  {/* Swap selection toggle */}
                  <button
                    type="button"
                    className={`w-5 h-5 flex-shrink-0 rounded text-[10px] font-bold transition-colors ${
                      isSelected
                        ? "bg-yellow-600 text-white"
                        : "bg-white/10 text-text-secondary hover:bg-white/20"
                    }`}
                    onClick={() => toggleSwapSelection(marker.id)}
                    data-testid={`swap-select-${marker.id}`}
                    aria-label={`${isSelected ? "Deselect" : "Select"} ${marker.name} for swap`}
                    aria-pressed={isSelected}
                  >
                    S
                  </button>

                  {/* Seek button: marker name + time */}
                  <button
                    type="button"
                    className="flex-1 text-left px-1 py-0.5 rounded text-xs hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between min-w-0"
                    onClick={() => onSeekToMarker(marker.time)}
                    data-testid="marker-item"
                    aria-label={`Seek to ${marker.name}`}
                  >
                    <span className="text-text-primary truncate">{marker.name}</span>
                    <span className="text-text-secondary/60 ml-2 tabular-nums flex-shrink-0">
                      {formatTime(marker.time)}
                    </span>
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    className="w-5 h-5 flex-shrink-0 rounded text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center justify-center"
                    onClick={() => onDeleteMarker(marker.id)}
                    data-testid={`delete-marker-${marker.id}`}
                    aria-label={`Delete ${marker.name}`}
                  >
                    ×
                  </button>
                </div>

                {/* Memo input */}
                <div className="px-1 pb-1">
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent"
                    placeholder="memo..."
                    value={marker.memo ?? ""}
                    onChange={(e) => onUpdateMemo(marker.id, e.target.value)}
                    onBlur={(e) => onUpdateMemo(marker.id, e.target.value)}
                    data-testid={`marker-memo-${marker.id}`}
                    aria-label={`Memo for ${marker.name}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
