const PLAYER_CONTAINER_ID = "youtube-player";

interface VideoPlayerProps {
  readonly containerId?: string;
  readonly onTogglePlay?: () => void;
}

export function VideoPlayer({
  containerId = PLAYER_CONTAINER_ID,
  onTogglePlay,
}: VideoPlayerProps) {
  return (
    <div
      className="relative w-full h-full bg-black"
      data-testid="video-player"
    >
      <div id={containerId} className="w-full h-full pointer-events-none" />
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-transparent border-none cursor-pointer p-0"
        data-testid="video-overlay"
        aria-label="Toggle play"
        onClick={onTogglePlay}
      />
    </div>
  );
}

VideoPlayer.CONTAINER_ID = PLAYER_CONTAINER_ID;
