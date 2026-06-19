import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import { useRoomStore } from "../store";
import { Search as SearchIcon, Loader2 } from "lucide-react";

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { default: { url: string } };
  };
}

export const Search = () => {
  const { currentRoom } = useRoomStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [searching, setSearching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSearching(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=6&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
        );
        const data = await res.json();
        setResults(data.items || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [query]);

  const addToQueue = (video: YouTubeVideo) => {
    if (!currentRoom) return;
    socket.emit("add_to_queue", {
      roomCode: currentRoom,
      video: {
        videoId: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.default.url,
      },
    });
    setQuery("");
    setResults([]);
  };

  if (!currentRoom) return null;

  return (
    <div className="sidebar-search-wrap">
      <div className="search-field">
        <span className="search-icon-wrap">
          {searching
            ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
            : <SearchIcon size={14} />
          }
        </span>
        <input
          placeholder="Search songs, artists…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {results.length > 0 && (
        <div className="search-results">
          {results.map(v => (
            <div
              key={v.id.videoId}
              className="search-result-item"
              onClick={() => addToQueue(v)}
            >
              <img
                className="search-thumb"
                src={v.snippet.thumbnails.default.url}
                alt=""
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="search-result-title">{v.snippet.title}</div>
                <div className="search-result-channel">{v.snippet.channelTitle}</div>
              </div>
              <div className="search-add-btn">+ Add</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
