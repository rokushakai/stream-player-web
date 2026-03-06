import { useCallback, useState } from "react";
import { UrlBar } from "./components/UrlBar";
import { VideoPlayer } from "./components/VideoPlayer";
import { TransportBar } from "./components/TransportBar";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";
import { extractVideoId } from "./utils/youtube-api";
import type { StreamInfo } from "./types/youtube";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  const {
    loadVideo,
    togglePlay,
    seekTo,
    setVolume,
    currentTime,
    duration,
    playerState,
    volume,
    playbackRate,
  } = useYouTubePlayer({
    containerId: VideoPlayer.CONTAINER_ID,
  });

  const handleUrlSubmit = useCallback(
    async (url: string) => {
      setIsLoading(true);
      setError(null);
      setTitle(null);

      try {
        let videoId = extractVideoId(url);
        let resolvedTitle: string | null = null;

        if (!videoId) {
          const res = await fetch("/api/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || "Failed to resolve URL");
          }

          const info: StreamInfo = await res.json();
          videoId = info.video_id;
          resolvedTitle = info.title;
        }

        if (videoId) {
          loadVideo(videoId);
          setTitle(resolvedTitle || url);
        } else {
          throw new Error("Could not extract video ID from URL");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [loadVideo],
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <UrlBar
        onSubmit={handleUrlSubmit}
        isLoading={isLoading}
        error={error}
        title={title}
      />
      <VideoPlayer />
      <TransportBar
        currentTime={currentTime}
        duration={duration}
        playerState={playerState}
        volume={volume}
        playbackRate={playbackRate}
        onTogglePlay={togglePlay}
        onSeek={seekTo}
        onVolumeChange={setVolume}
      />
    </div>
  );
}

export default App;
