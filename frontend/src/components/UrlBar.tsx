import { useState, type FormEvent } from "react";
import styles from "./UrlBar.module.css";

interface UrlBarProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error: string | null;
  title: string | null;
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
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL..."
          disabled={isLoading}
          data-testid="url-input"
        />
        <button
          type="submit"
          className={styles.button}
          disabled={isLoading || !url.trim()}
          data-testid="url-submit"
        >
          {isLoading ? "Loading..." : "Go"}
        </button>
      </form>
      {title && (
        <div className={styles.title} data-testid="video-title">
          {title}
        </div>
      )}
      {error && (
        <div className={styles.error} data-testid="url-error">
          {error}
        </div>
      )}
    </div>
  );
}
