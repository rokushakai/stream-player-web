import { useCallback, useState } from "react";
import { UrlBar } from "./components/UrlBar";
import { VideoPlayer } from "./components/VideoPlayer";
import { TransportBar } from "./components/TransportBar";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";
import { extractVideoId } from "./utils/youtube-api";
import type { StreamInfo } from "./types/youtube";
import styles from "./App.module.css";

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
        // Try to extract video ID directly from URL first
        let videoId = extractVideoId(url);

        if (!videoId) {
          // Fall back to backend resolution
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
          setTitle(info.title);
        }

        if (videoId) {
          loadVideo(videoId);
          if (!title) {
            setTitle(url);
          }
        } else {
          throw new Error("Could not extract video ID from URL");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [loadVideo, title],
  );

  return (
    <div className={styles.app}>
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
