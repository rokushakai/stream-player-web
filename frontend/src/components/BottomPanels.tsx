interface BottomPanelsProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function BottomPanels({ className = "", style }: BottomPanelsProps) {
  return (
    <div
      className={`flex bg-bg-secondary text-text-primary overflow-hidden ${className}`}
      style={style}
      data-testid="bottom-panels"
    >
      <div className="flex-1 border-r border-white/10 p-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Markers
        </h3>
        <p className="text-xs text-text-secondary/60">No markers yet</p>
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
