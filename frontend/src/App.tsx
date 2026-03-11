import { useCallback, useEffect, useRef, useState } from "react";
import { UrlBar } from "./components/UrlBar";
import { VideoPlayer } from "./components/VideoPlayer";
import { TransportBar } from "./components/TransportBar";
import { ResizeSash } from "./components/ResizeSash";
import { BottomPanels } from "./components/BottomPanels";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useUrlHistory } from "./hooks/useUrlHistory";
import type { UrlHistoryEntry } from "./hooks/useUrlHistory";
import {
  extractVideoId,
  isValidUrl,
  fetchYouTubeTitle,
} from "./utils/youtube-api";
import type { StreamInfo } from "./types/youtube";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(200);
  const containerRef = useRef<HTMLDivElement>(null);
  const { history, addEntry } = useUrlHistory();

  const {
    loadVideo,
    togglePlay,
    seekTo,
    seekRelative,
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
        if (!isValidUrl(url)) {
          throw new Error("有効なURLを入力してください");
        }

        let videoId = extractVideoId(url);
        let resolvedTitle: string | null = null;

        if (videoId) {
          // YouTube URL: validate and fetch title via oEmbed
          resolvedTitle = await fetchYouTubeTitle(videoId);
          if (!resolvedTitle) {
            throw new Error("動画が見つかりませんでした");
          }
          loadVideo(videoId);
          setTitle(resolvedTitle);
          addEntry(url, resolvedTitle);
        } else {
          // Non-YouTube URL: resolve via backend
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

          if (videoId) {
            loadVideo(videoId);
            setTitle(resolvedTitle || url);
            addEntry(url, resolvedTitle || url);
          } else {
            throw new Error("Could not extract video ID from URL");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [loadVideo, addEntry],
  );

  const handleSelectHistory = useCallback(
    (entry: UrlHistoryEntry) => {
      handleUrlSubmit(entry.url);
    },
    [handleUrlSubmit],
  );

  // Sync isFullscreen state with actual fullscreen changes (Esc key, etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useKeyboardShortcuts({
    togglePlay,
    seekRelative,
    seekTo,
    setVolume,
    volume,
    duration,
    playerState,
  });

  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  const handleResize = useCallback((deltaY: number) => {
    setPanelHeight((prev) => Math.max(80, Math.min(600, prev - deltaY)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-screen bg-bg-primary overflow-hidden"
    >
      {/* URL bar */}
      {!isFullscreen && (
        <UrlBar
          onSubmit={handleUrlSubmit}
          isLoading={isLoading}
          error={error}
          title={title}
          history={history}
          onSelectHistory={handleSelectHistory}
        />
      )}

      {/* Video player - fills remaining space */}
      <div className="flex-1 min-h-0">
        <VideoPlayer onTogglePlay={togglePlay} />
      </div>

      {/* Transport controls */}
      {!isFullscreen && (
        <TransportBar
          currentTime={currentTime}
          duration={duration}
          playerState={playerState}
          volume={volume}
          playbackRate={playbackRate}
          onTogglePlay={togglePlay}
          onSeek={seekTo}
          onVolumeChange={setVolume}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Resize sash */}
      {!isFullscreen && <ResizeSash onResize={handleResize} />}

      {/* Bottom panels */}
      {!isFullscreen && (
        <BottomPanels
          className="flex-shrink-0"
          style={{ height: panelHeight }}
        />
      )}
    </div>
  );
}

export default App;
