import { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { socket } from "../socket";
import { usePlayerStore, useRoomStore } from "../store";

export const Player = () => {
  const { videoId, setVideoId, setPlayer, setCurrentTime, setIsPlaying } =
    usePlayerStore();
  const { currentRoom, hostId } = useRoomStore();
  const playerRef = useRef(null);
  const syncTimeoutRef = useRef(null);

  // ========================
  // READY
  // ========================
  const onReady = (event) => {
    setPlayer(event.target);
    playerRef.current = event.target;
  };

  // ========================
  // STATE CHANGE
  // ========================
  const onStateChange = (event) => {
    const YT = window.YT;

    // Video ended
    if (event.data === YT.PlayerState.ENDED) {
      if (currentRoom) {
        socket.emit("song_ended", { roomCode: currentRoom });
      }
    }

    // Playing
    if (event.data === YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    }

    // Paused
    if (event.data === YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    }
  };

  // ========================
  // SYNC STATE HANDLER
  // ========================
  useEffect(() => {
    const handleSyncState = (state) => {
      if (!playerRef.current) return;

      const { videoId: newVideoId, currentTime, isPlaying } = state;

      setVideoId(newVideoId);

      // Clear pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Apply sync with delay
      syncTimeoutRef.current = setTimeout(() => {
        if (!playerRef.current) return;

        try {
          const drift = Math.abs(playerRef.current.getCurrentTime() - currentTime);

          // Resync if drift > 1 second
          if (drift > 1) {
            playerRef.current.seekTo(currentTime, true);
            console.log(`🔄 Synced (drift: ${drift.toFixed(2)}s)`);
          }

          if (isPlaying) {
            playerRef.current.playVideo();
          } else {
            playerRef.current.pauseVideo();
          }
        } catch (error) {
          console.error("Sync error:", error);
        }
      }, 300);
    };

    socket.on("sync_state", handleSyncState);
    return () => {
      socket.off("sync_state", handleSyncState);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [setVideoId, setCurrentTime, setIsPlaying]);

  return (
    <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl">
      <YouTube
        videoId={videoId}
        onReady={onReady}
        onStateChange={onStateChange}
        opts={{
          height: "390",
          width: "100%",
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
          },
        }}
      />
    </div>
  );
};