import yt_dlp


class StreamResolver:
    """Resolve streaming URLs using yt-dlp to extract metadata."""

    _ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
        "skip_download": True,
    }

    @staticmethod
    def resolve(url: str) -> dict:
        with yt_dlp.YoutubeDL(StreamResolver._ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if info is None:
                raise ValueError(f"Could not resolve URL: {url}")
            return {
                "url": info.get("webpage_url", url),
                "title": info.get("title", "Unknown"),
                "duration": info.get("duration"),
                "video_id": info.get("id"),
            }
