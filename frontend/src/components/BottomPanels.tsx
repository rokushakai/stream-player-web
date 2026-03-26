import { MarkersPanel } from "./MarkersPanel";
import type { Marker } from "../hooks/useMarkers";

interface BottomPanelsProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly markers?: Marker[];
  readonly onAddMarker?: () => void;
  readonly onSeekToMarker?: (time: number) => void;
  readonly onUpdateMemo?: (id: number, memo: string) => void;
  readonly onDeleteMarker?: (id: number) => void;
  readonly onSwapMarkerLabels?: (idA: number, idB: number) => void;
}

const noop = () => {};

export function BottomPanels({
  className = "",
  style,
  markers = [],
  onAddMarker,
  onSeekToMarker,
  onUpdateMemo,
  onDeleteMarker,
  onSwapMarkerLabels,
}: BottomPanelsProps) {
  return (
    <div
      className={`flex bg-bg-secondary text-text-primary overflow-hidden ${className}`}
      style={style}
      data-testid="bottom-panels"
    >
      <div className="flex-1 border-r border-white/10 p-3">
        <MarkersPanel
          markers={markers}
          onAddMarker={onAddMarker ?? noop}
          onSeekToMarker={onSeekToMarker ?? noop}
          onUpdateMemo={onUpdateMemo ?? noop}
          onDeleteMarker={onDeleteMarker ?? noop}
          onSwapMarkerLabels={onSwapMarkerLabels ?? noop}
        />
      </div>
      <div className="flex-1 border-r border-white/10 p-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Sequence
        </h3>
        <p className="text-xs text-text-secondary/60">No sequences yet</p>
      </div>
      <div className="flex-1 p-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Playlist
        </h3>
        <p className="text-xs text-text-secondary/60">No items yet</p>
      </div>
    </div>
  );
}
