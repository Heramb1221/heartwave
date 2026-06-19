import { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { socket } from "../socket";
import { usePlayerStore, useRoomStore, useQueueStore } from "../store";

interface SyncState {
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
}

export const Player = () => {
  const { videoId, setVideoId, setPlayer, setIsPlaying, isPlaying } = usePlayerStore();
  const { currentRoom } = useRoomStore();
  const { queue } = useQueueStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstSyncRef = useRef(true);

  const nowPlaying = queue.find(v => v.videoId === videoId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onReady = (event: any) => {
    setPlayer(event.target);
    playerRef.current = event.target;
    isFirstSyncRef.current = true;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onStateChange = (event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const YT = ((window as unknown) as { YT: { PlayerState: Record<string, number> } }).YT;
    if (event.data === YT.PlayerState.ENDED && currentRoom) {
      socket.emit("song_ended", { roomCode: currentRoom });
    }
    if (event.data === YT.PlayerState.PLAYING) setIsPlaying(true);
    if (event.data === YT.PlayerState.PAUSED) setIsPlaying(false);
  };

  useEffect(() => {
    const handleSyncState = (state: SyncState) => {
      if (!playerRef.current) return;
      const { videoId: newVideoId, currentTime, isPlaying } = state;
      if (newVideoId !== videoId) { setVideoId(newVideoId); return; }
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        if (!playerRef.current) return;
        try {
          const drift = Math.abs(playerRef.current.getCurrentTime() - currentTime);
          if (isFirstSyncRef.current || drift > 2) {
            playerRef.current.seekTo(currentTime, true);
            isFirstSyncRef.current = false;
          }
          if (isPlaying) playerRef.current.playVideo();
          else playerRef.current.pauseVideo();
        } catch (err) { console.error("Sync error:", err); }
      }, 250);
    };
    socket.on("sync_state", handleSyncState);
    return () => {
      socket.off("sync_state", handleSyncState);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [videoId, setVideoId]);

  return (
    <>
      {/* Track info bar */}
      <div className="track-bar">
        <div className="track-meta">
          <div className="track-title">
            {nowPlaying ? nowPlaying.title : "Melodies Player"}
          </div>
          <div className="track-room">
            {currentRoom ? `Room · ${currentRoom}` : "Waiting for track…"}
          </div>
        </div>
        {isPlaying && (
          <div className="track-badge">
            <div className="eq-wrap">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="eq-bar" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            Now Playing
          </div>
        )}
      </div>

      {/* Video area */}
      <div className="video-area">
        {!videoId && (
          <div className="video-placeholder">
            <div className="video-play-btn">▶</div>
            <div className="video-placeholder-label">Add songs to the queue to get started</div>
          </div>
        )}
        <div
          style={{
            position: "absolute", inset: 0,
            opacity: videoId ? 1 : 0,
            pointerEvents: videoId ? "auto" : "none",
          }}
        >
          <YouTube
            videoId={videoId}
            onReady={onReady}
            onStateChange={onStateChange}
            opts={{
              height: "100%",
              width: "100%",
              playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0 },
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        {videoId && <div className="video-yt-label">YouTube · 16:9</div>}
      </div>
    </>
  );
};
