const PLAYER_CONTAINER_ID = "youtube-player";

interface VideoPlayerProps {
  readonly containerId?: string;
}

export function VideoPlayer({
  containerId = PLAYER_CONTAINER_ID,
}: VideoPlayerProps) {
  return (
    <div
      className="flex-1 bg-black flex items-center justify-center min-h-[300px] relative"
      data-testid="video-player"
    >
      <div id={containerId} className="w-full h-full absolute top-0 left-0" />
    </div>
  );
}

VideoPlayer.CONTAINER_ID = PLAYER_CONTAINER_ID;
