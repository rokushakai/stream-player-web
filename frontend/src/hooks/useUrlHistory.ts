import { useCallback, useState } from "react";

const STORAGE_KEY = "stream_player_url_history";
const MAX_ENTRIES = 50;

export interface UrlHistoryEntry {
  url: string;
  title: string;
}

function loadHistory(): UrlHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e: unknown): e is UrlHistoryEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as UrlHistoryEntry).url === "string" &&
        typeof (e as UrlHistoryEntry).title === "string",
    );
  } catch {
    return [];
  }
}

function saveHistory(entries: UrlHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useUrlHistory() {
  const [history, setHistory] = useState<UrlHistoryEntry[]>(loadHistory);

  const addEntry = useCallback((url: string, title: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((e) => e.url !== url);
      const next = [{ url, title }, ...filtered].slice(0, MAX_ENTRIES);
      saveHistory(next);
      return next;
    });
  }, []);

  return { history, addEntry };
}
