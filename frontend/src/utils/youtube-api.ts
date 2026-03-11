/** Load YouTube IFrame API script once */

let apiLoadPromise: Promise<void> | null = null;

export function loadYouTubeAPI(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise<void>((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    window.onYouTubeIframeAPIReady = () => resolve();

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });

  return apiLoadPromise;
}

/** Extract video ID from various YouTube URL formats */
export function extractVideoId(url: string): string | null {
  const pattern =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const result = pattern.exec(url);
  return result?.[1] ?? null;
}

/** Check if a string looks like a valid URL */
export function isValidUrl(input: string): boolean {
  return /^https?:\/\/.+/.test(input);
}

/** Fetch video title from YouTube oEmbed API (no API key required) */
export async function fetchYouTubeTitle(
  videoId: string,
): Promise<string | null> {
  const videoUrl = "https://www.youtube.com/watch?v=" + videoId;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) return null;
  const data = await res.json();
  return data.title ?? null;
}
