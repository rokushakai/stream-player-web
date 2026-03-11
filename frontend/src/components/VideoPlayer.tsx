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
      <div
        className="absolute inset-0"
        data-testid="video-overlay"
        onClick={onTogglePlay}
      />
    </div>
  );
}

VideoPlayer.CONTAINER_ID = PLAYER_CONTAINER_ID;
