import { useCallback, useEffect, useRef, useState } from "react";
import type { YouTubePlayer } from "../types/youtube";
import { PlayerState } from "../types/youtube";
import { loadYouTubeAPI } from "../utils/youtube-api";

interface UseYouTubePlayerOptions {
  containerId: string;
  onStateChange?: (state: PlayerState) => void;
  onReady?: () => void;
  onError?: (errorCode: number) => void;
}

interface UseYouTubePlayerReturn {
  /** Load a video by its YouTube video ID */
  loadVideo: (videoId: string) => void;
  /** Toggle play/pause */
  togglePlay: () => void;
  /** Seek to absolute position in seconds */
  seekTo: (seconds: number) => void;
  /** Seek relative to current position */
  seekRelative: (delta: number) => void;
  /** Set volume (0-100) */
  setVolume: (volume: number) => void;
  /** Set playback rate */
  setPlaybackRate: (rate: number) => void;
  /** Current time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Current player state */
  playerState: PlayerState;
  /** Current volume (0-100) */
  volume: number;
  /** Current playback rate */
  playbackRate: number;
  /** Whether the player is ready */
  isReady: boolean;
}

export function useYouTubePlayer({
  containerId,
  onStateChange,
  onReady,
  onError,
}: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const timerRef = useRef<number | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>(
    PlayerState.UNSTARTED,
  );
  const [volume, setVolumeState] = useState(100);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isReady, setIsReady] = useState(false);

  // Poll current time while playing
  const startTimePolling = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (player) {
        setCurrentTime(player.getCurrentTime());
      }
    }, 250);
  }, []);

  const stopTimePolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialize player
  useEffect(() => {
    let destroyed = false;

    loadYouTubeAPI().then(() => {
      if (destroyed) return;

      const player = new window.YT.Player(containerId, {
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (destroyed) return;
            setIsReady(true);
            setVolumeState(player.getVolume());
            onReady?.();
          },
          onStateChange: (event) => {
            if (destroyed) return;
            const state = event.data as PlayerState;
            setPlayerState(state);
            onStateChange?.(state);

            if (state === PlayerState.PLAYING) {
              setDuration(player.getDuration());
              startTimePolling();
            } else {
              stopTimePolling();
              setCurrentTime(player.getCurrentTime());
            }
          },
          onError: (event) => {
            if (destroyed) return;
            onError?.(event.data);
          },
        },
      });

      playerRef.current = player;
    });

    return () => {
      destroyed = true;
      stopTimePolling();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [containerId, onStateChange, onReady, onError, startTimePolling, stopTimePolling]);

  const loadVideo = useCallback((videoId: string) => {
    playerRef.current?.stopVideo();
    // Use cueVideoById + playVideo for more control
    playerRef.current?.seekTo(0, true);
    // loadVideoById is available on the player but not in our minimal types
    (playerRef.current as unknown as { loadVideoById(id: string): void })?.loadVideoById(videoId);
  }, []);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    const state = player.getPlayerState();
    if (state === PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    setCurrentTime(seconds);
  }, []);

  const seekRelative = useCallback(
    (delta: number) => {
      const player = playerRef.current;
      if (!player) return;
      const newTime = Math.max(
        0,
        Math.min(player.getCurrentTime() + delta, player.getDuration()),
      );
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
    },
    [],
  );

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(100, vol));
    playerRef.current?.setVolume(clamped);
    setVolumeState(clamped);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
    setPlaybackRateState(rate);
  }, []);

  return {
    loadVideo,
    togglePlay,
    seekTo,
    seekRelative,
    setVolume,
    setPlaybackRate,
    currentTime,
    duration,
    playerState,
    volume,
    playbackRate,
    isReady,
  };
}
