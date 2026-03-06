import { useState, type FormEvent } from "react";

interface UrlBarProps {
  readonly onSubmit: (url: string) => void;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly title: string | null;
}

export function UrlBar({ onSubmit, isLoading, error, title }: UrlBarProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="px-4 py-2 bg-bg-secondary border-b border-white/10">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-1 px-3 py-2 bg-bg-primary text-text-primary border border-white/15 rounded text-sm outline-none focus:border-accent disabled:opacity-60"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL..."
          disabled={isLoading}
          data-testid="url-input"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-accent text-white border-none rounded text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !url.trim()}
          data-testid="url-submit"
        >
          {isLoading ? "Loading..." : "Go"}
        </button>
      </form>
      {title && (
        <div
          className="mt-1.5 text-xs text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap"
          data-testid="video-title"
        >
          {title}
        </div>
      )}
      {error && (
        <div
          className="mt-1.5 text-xs text-error"
          data-testid="url-error"
        >
          {error}
        </div>
      )}
    </div>
  );
}
