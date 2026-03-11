import { useRef, useState, type FormEvent } from "react";
import type { UrlHistoryEntry } from "../hooks/useUrlHistory";

interface UrlBarProps {
  readonly onSubmit: (url: string) => void;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly title: string | null;
  readonly history?: UrlHistoryEntry[];
  readonly onSelectHistory?: (entry: UrlHistoryEntry) => void;
}

export function UrlBar({
  onSubmit,
  isLoading,
  error,
  title,
  history = [],
  onSelectHistory,
}: UrlBarProps) {
  const [url, setUrl] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setDropdownOpen(false);
    }
  };

  const handleSelect = (entry: UrlHistoryEntry) => {
    setUrl(entry.url);
    setDropdownOpen(false);
    onSelectHistory?.(entry);
  };

  const handleFocus = () => {
    if (history.length > 0) {
      setDropdownOpen(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Close dropdown only if focus moves outside the wrapper
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setDropdownOpen(false);
    }
  };

  return (
    <div className="px-5 py-3 bg-bg-secondary border-b border-white/10">
      <div ref={wrapperRef} className="relative" onBlur={handleBlur}>
        <form className="flex gap-3" onSubmit={handleSubmit}>
          <input
            type="text"
            className="flex-1 min-w-0 px-4 py-3 bg-bg-primary text-text-primary border border-white/15 rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-60 placeholder:text-text-secondary/60"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={handleFocus}
            placeholder="Enter YouTube URL..."
            disabled={isLoading}
            data-testid="url-input"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-accent text-white border-none rounded-lg text-base font-semibold cursor-pointer whitespace-nowrap hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed min-w-[110px] transition-colors"
            disabled={isLoading || !url.trim()}
            data-testid="url-submit"
          >
            {isLoading ? "Loading..." : "Go"}
          </button>
        </form>

        {/* History dropdown */}
        {dropdownOpen && history.length > 0 && (
          <ul
            className="absolute left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-bg-primary border border-white/15 rounded-lg shadow-lg z-50"
            data-testid="url-history-dropdown"
          >
            {history.map((entry) => (
              <li key={entry.url}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors cursor-pointer"
                  data-testid="url-history-item"
                  onMouseDown={(e) => {
                    // Prevent blur from firing before click
                    e.preventDefault();
                    handleSelect(entry);
                  }}
                >
                  <div className="text-sm text-text-primary truncate">
                    {entry.title}
                  </div>
                  <div className="text-xs text-text-secondary/60 truncate">
                    {entry.url}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {title && (
        <div
          className="mt-2 text-sm text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap"
          data-testid="video-title"
        >
          {title}
        </div>
      )}
      {error && (
        <div className="mt-2 text-sm text-error" data-testid="url-error">
          {error}
        </div>
      )}
    </div>
  );
}
