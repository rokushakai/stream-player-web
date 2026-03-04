/** YouTube IFrame Player API type definitions */

export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  getAvailablePlaybackRates(): number[];
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): PlayerState;
  getVideoUrl(): string;
  destroy(): void;
}

export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export interface PlayerEvent {
  target: YouTubePlayer;
  data: number;
}

export interface PlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: PlayerVars;
  events?: {
    onReady?: (event: PlayerEvent) => void;
    onStateChange?: (event: PlayerEvent) => void;
    onError?: (event: PlayerEvent) => void;
  };
}

export interface PlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  disablekb?: 0 | 1;
  enablejsapi?: 0 | 1;
  modestbranding?: 0 | 1;
  rel?: 0 | 1;
  origin?: string;
  playsinline?: 0 | 1;
}

/** Resolved stream metadata from backend */
export interface StreamInfo {
  url: string;
  title: string;
  duration: number | null;
  video_id: string | null;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: PlayerOptions,
      ) => YouTubePlayer;
      PlayerState: typeof PlayerState;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}
