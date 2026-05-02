import { useUser } from "@clerk/clerk-react";
import { socket } from "../socket";
import { useRoomStore, usePlayerStore } from "../store";
import { Play, Pause, RotateCcw, Copy, LogOut } from "lucide-react";

export const Controls = ({ onCreateRoom, onJoinRoom, roomCode, setRoomCode }) => {
  const { user } = useUser();
  const { currentRoom, hostId, setCurrentRoom } = useRoomStore();
  const { player, isPlaying } = usePlayerStore();

  const isHost = user?.id === hostId;

  // ========================
  // PLAYBACK CONTROLS
  // ========================
  const handlePlay = () => {
    if (!player || !currentRoom || !isHost) return;

    const time = player.getCurrentTime();
    player.playVideo();

    socket.emit("play", {
      roomCode: currentRoom,
      videoId: player.getVideoData().video_id,
      time,
      userId: user?.id,
    });
  };

  const handlePause = () => {
    if (!player || !currentRoom || !isHost) return;

    const time = player.getCurrentTime();
    player.pauseVideo();

    socket.emit("pause", {
      roomCode: currentRoom,
      time,
      userId: user?.id,
    });
  };

  const handleSync = () => {
    if (!player || !currentRoom || !isHost) return;

    const time = player.getCurrentTime();
    socket.emit("seek", {
      roomCode: currentRoom,
      time,
      userId: user?.id,
    });
  };

  // ========================
  // ROOM CONTROLS
  // ========================
  const handleLeaveRoom = () => {
    socket.emit("leave_room", { roomCode: currentRoom });
    setCurrentRoom(null);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(currentRoom);
    alert("Room code copied!");
  };

  // ========================
  // RENDER
  // ========================
  if (!currentRoom) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={onCreateRoom}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
          >
            🎵 Create Room
          </button>
        </div>

        <div className="flex gap-2">
          <input
            placeholder="Enter room code..."
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            onClick={onJoinRoom}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg transition"
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Room Info */}
      <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-4 border border-slate-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">Room Code</span>
          <button
            onClick={copyRoomCode}
            className="text-pink-400 hover:text-pink-300 transition"
          >
            <Copy size={16} />
          </button>
        </div>
        <p className="text-white font-mono text-lg font-bold">{currentRoom}</p>
        {isHost && <span className="text-yellow-400 text-xs mt-2 block">👑 You are the host</span>}
      </div>

      {/* Playback Controls */}
      {isHost && (
        <div className="flex gap-2">
          <button
            onClick={handlePlay}
            disabled={!isPlaying}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Play size={20} /> Play
          </button>
          <button
            onClick={handlePause}
            disabled={isPlaying}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Pause size={20} /> Pause
          </button>
          <button
            onClick={handleSync}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} /> Sync
          </button>
        </div>
      )}

      {/* Leave Room */}
      <button
        onClick={handleLeaveRoom}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
      >
        <LogOut size={18} /> Leave Room
      </button>
    </div>
  );
};