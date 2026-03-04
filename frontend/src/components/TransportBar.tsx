import { PlayerState } from "../types/youtube";
import { formatTime } from "../utils/format";
import styles from "./TransportBar.module.css";

interface TransportBarProps {
  currentTime: number;
  duration: number;
  playerState: PlayerState;
  volume: number;
  playbackRate: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
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
    <div className={styles.container}>
      {/* Timeline / Progress bar */}
      <div
        className={styles.timeline}
        onClick={handleTimelineClick}
        data-testid="timeline"
      >
        <div
          className={styles.progress}
          style={{ width: `${progress}%` }}
        />
        <div
          className={styles.playhead}
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Controls row */}
      <div className={styles.controls}>
        <button
          className={styles.playButton}
          onClick={onTogglePlay}
          data-testid="play-button"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <span className={styles.time} data-testid="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className={styles.spacer} />

        <div className={styles.volumeControl}>
          <span className={styles.volumeIcon}>
            {volume === 0 ? "🔇" : volume < 50 ? "🔉" : "🔊"}
          </span>
          <input
            type="range"
            className={styles.volumeSlider}
            min={0}
            max={100}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            data-testid="volume-slider"
          />
        </div>

        {playbackRate !== 1 && (
          <span className={styles.rate} data-testid="playback-rate">
            {playbackRate}x
          </span>
        )}
      </div>
    </div>
  );
}
