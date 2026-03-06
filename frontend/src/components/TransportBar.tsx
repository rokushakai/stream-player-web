import { PlayerState } from "../types/youtube";
import { formatTime } from "../utils/format";

interface TransportBarProps {
  readonly currentTime: number;
  readonly duration: number;
  readonly playerState: PlayerState;
  readonly volume: number;
  readonly playbackRate: number;
  readonly onTogglePlay: () => void;
  readonly onSeek: (time: number) => void;
  readonly onVolumeChange: (volume: number) => void;
}

export function TransportBar({
  currentTime,
  duration,
  playerState,
  volume,
  playbackRate,
  onTogglePlay,
  onSeek,
  onVolumeChange,
}: TransportBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isPlaying = playerState === PlayerState.PLAYING;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(ratio * duration);
  };

  return (
    <div className="bg-bg-secondary border-t border-white/10">
      {/* Timeline / Progress bar */}
      <div
        className="h-1 bg-white/15 cursor-pointer relative hover:h-1.5 transition-[height]"
        onClick={handleTimelineClick}
        data-testid="timeline"
      >
        <div
          className="h-full bg-accent absolute top-0 left-0"
          style={{ width: `${progress}%` }}
        />
        <div
          className="w-3 h-3 rounded-full bg-white absolute top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 px-4 py-1.5">
        <button
          className="bg-transparent border-none text-text-primary text-lg cursor-pointer p-1 leading-none hover:text-accent"
          onClick={onTogglePlay}
          data-testid="play-button"
        >
          {isPlaying ? "\u23F8" : "\u25B6"}
        </button>

        <span
          className="text-xs text-text-secondary tabular-nums"
          data-testid="time-display"
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <span className="text-sm">
            {volume === 0 ? "\uD83D\uDD07" : volume < 50 ? "\uD83D\uDD09" : "\uD83D\uDD0A"}
          </span>
          <input
            type="range"
            className="w-20 accent-accent"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            data-testid="volume-slider"
          />
        </div>

        {playbackRate !== 1 && (
          <span
            className="text-xs text-accent font-semibold"
            data-testid="playback-rate"
          >
            {playbackRate}x
          </span>
        )}
      </div>
    </div>
  );
}
