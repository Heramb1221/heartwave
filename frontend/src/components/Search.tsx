import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import { useRoomStore } from "../store";
import { Search as SearchIcon, Plus } from "lucide-react";

export const Search = () => {
  const { currentRoom } = useRoomStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef(null);

  // ========================
  // SEARCH
  // ========================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSearching(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            searchQuery
          )}&type=video&maxResults=8&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
        );

        const data = await res.json();
        setResults(data.items || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  // ========================
  // ADD TO QUEUE
  // ========================
  const addToQueue = (video) => {
    if (!currentRoom) {
      alert("Join a room first!");
      return;
    }

    socket.emit("add_to_queue", {
      roomCode: currentRoom,
      video: {
        videoId: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.default.url,
      },
    });

    setSearchQuery("");
  };

  // ========================
  // RENDER
  // ========================
  if (!currentRoom) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <SearchIcon
          size={18}
          className="absolute left-3 top-3 text-slate-400"
        />
        <input
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((video) => (
            <div
              key={video.id.videoId}
              className="flex gap-3 bg-slate-700/50 p-3 rounded-lg hover:bg-slate-600/50 transition group"
            >
              <img
                src={video.snippet.thumbnails.default.url}
                alt={video.snippet.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {video.snippet.title}
                </p>
                <p className="text-slate-400 text-xs truncate">
                  {video.snippet.channelTitle}
                </p>
              </div>
              <button
                onClick={() => addToQueue(video)}
                className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded transition opacity-0 group-hover:opacity-100"
              >
                <Plus size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isSearching && (
        <div className="text-center text-slate-400 text-sm">
          🔍 Searching...
        </div>
      )}

      {searchQuery && results.length === 0 && !isSearching && (
        <div className="text-center text-slate-400 text-sm">
          No results found
        </div>
      )}
    </div>
  );
};