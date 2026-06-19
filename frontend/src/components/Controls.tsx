import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { socket } from "../socket";
import { useRoomStore, usePlayerStore } from "../store";

export const Controls = () => {
  const { user } = useUser();
  const { currentRoom, hostId } = useRoomStore();
  const { player, isPlaying } = usePlayerStore();
  const isHost = user?.id === hostId;

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlay = () => {
    if (!player || !currentRoom || !isHost) return;
    socket.emit("play", {
      roomCode: currentRoom,
      videoId: player.getVideoData().video_id,
      time: player.getCurrentTime(),
      userId: user?.id,
    });
  };

  const handlePause = () => {
    if (!player || !currentRoom || !isHost) return;
    socket.emit("pause", {
      roomCode: currentRoom,
      time: player.getCurrentTime(),
      userId: user?.id,
    });
  };

  const handleSync = () => {
    if (!player || !currentRoom || !isHost) return;
    socket.emit("play", {
      roomCode: currentRoom,
      videoId: player.getVideoData().video_id,
      time: player.getCurrentTime(),
      userId: user?.id,
    });
  };

  const handleNext = () => {
    if (!currentRoom || !isHost) return;
    socket.emit("song_ended", { roomCode: currentRoom });
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && player) {
      interval = setInterval(() => {
        setProgress(player.getCurrentTime() || 0);
        setDuration(player.getDuration() || 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, player]);

  const fmt = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="controls-bar">
      {/* Prev */}
      <button className="ctrl-btn" disabled={!isHost} title="Previous">⏮</button>

      {/* Play / Pause */}
      <button
        className="ctrl-btn ctrl-btn-play"
        disabled={!isHost}
        onClick={isPlaying ? handlePause : handlePlay}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* Next */}
      <button className="ctrl-btn" disabled={!isHost} onClick={handleNext} title="Next">⏭</button>

      {/* Sync */}
      <button className="ctrl-btn ctrl-btn-sync" onClick={handleSync} title="Sync to host">⟳</button>

      {/* Progress */}
      <div className="progress-group">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-times">
          <span>{fmt(progress)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="vol-group">
        <span className="vol-icon">🔊</span>
        <input
          type="range"
          className="vol-slider"
          min="0"
          max="100"
          defaultValue="75"
          onChange={e => {
            if (player) player.setVolume(Number(e.target.value));
            const pct = e.target.value;
            e.target.style.background = `linear-gradient(90deg, var(--coral) ${pct}%, rgba(255,255,255,0.12) ${pct}%)`;
          }}
        />
      </div>
    </div>
  );
};
