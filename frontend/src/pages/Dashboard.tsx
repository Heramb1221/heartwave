/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useUser, UserButton, useAuth } from "@clerk/clerk-react";
import { socket } from "../socket";
import YouTube from "react-youtube";

type UserType = {
  name: string;
  socketId: string;
};

type SyncState = {
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
};

const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [roomCode, setRoomCode] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [player, setPlayer] = useState<any>(null);
  const [pendingSync, setPendingSync] = useState<SyncState | null>(null);

  // 🎬 Player Ready
  const onReady = (event: any) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
  };

  // 🧠 Apply sync safely
  const applySync = (playerInstance: any, state: SyncState) => {
    const { videoId, currentTime, isPlaying } = state;

    setVideoId(videoId);

    // Wait a bit to ensure video is loaded
    setTimeout(() => {
      const drift = Math.abs(playerInstance.getCurrentTime() - currentTime);

      if (drift > 0.5) {
        playerInstance.seekTo(currentTime, true);
      }

      if (isPlaying) {
        playerInstance.playVideo();
      } else {
        playerInstance.pauseVideo();
      }
    }, 300);
  };

  // 🎯 MAIN SYNC LISTENER
  useEffect(() => {
    const handleSync = (state: SyncState) => {
      console.log("SYNC RECEIVED:", state);

      if (!player) {
        setPendingSync(state);
        setVideoId(state.videoId);
        return;
      }cd

      applySync(player, state);
    };

    socket.on("sync_state", handleSync);

    return () => {
      socket.off("sync_state", handleSync);
    };
  }, [player]);

  // 🔁 Apply pending sync after video loads
  useEffect(() => {
    if (!player || !pendingSync) return;

    applySync(player, pendingSync);
    setPendingSync(null);
  }, [videoId]);

  // 🎮 REAL-TIME EVENTS
  useEffect(() => {
    if (!player) return;

    const handlePlay = ({ videoId, time }: any) => {
      setVideoId(videoId);
      setTimeout(() => {
        player.seekTo(time);
        player.playVideo();
      }, 300);
    };

    const handlePause = ({ time }: any) => {
      player.pauseVideo();
      player.seekTo(time);
    };

    const handleSeek = ({ time }: any) => {
      player.seekTo(time);
    };

    socket.on("play", handlePlay);
    socket.on("pause", handlePause);
    socket.on("seek", handleSeek);

    return () => {
      socket.off("play", handlePlay);
      socket.off("pause", handlePause);
      socket.off("seek", handleSeek);
    };
  }, [player]);

  // 🔌 SOCKET SETUP
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("room_users", (users: UserType[]) => {
      setUsers(users);
    });

    return () => {
      socket.off("connect");
      socket.off("room_users");
    };
  }, []);

  // 🔐 FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken();

        await fetch("http://localhost:5000/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  // 🏠 CREATE ROOM
  const createRoom = async () => {
    const token = await getToken();

    const res = await fetch("http://localhost:5000/api/room/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setCurrentRoom(data.roomCode);

    socket.emit("join_room", {
      roomCode: data.roomCode,
      user: {
        name: user?.firstName,
        socketId: socket.id,
      },
    });
  };

  // 🚪 JOIN ROOM
  const joinRoom = async () => {
    const token = await getToken();

    const res = await fetch("http://localhost:5000/api/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomCode }),
    });

    const data = await res.json();
    setCurrentRoom(data.roomCode);

    socket.emit("join_room", {
      roomCode: data.roomCode,
      user: {
        name: user?.firstName,
        socketId: socket.id,
      },
    });
  };

  // 🎮 CONTROLS
  const handlePlay = () => {
    if (!player || !currentRoom) return;

    const time = player.getCurrentTime();
    player.playVideo();

    socket.emit("play", {
      roomCode: currentRoom,
      videoId,
      time,
    });
  };

  const handlePause = () => {
    if (!player || !currentRoom) return;

    const time = player.getCurrentTime();
    player.pauseVideo();

    socket.emit("pause", {
      roomCode: currentRoom,
      time,
    });
  };

  const handleSeek = () => {
    if (!player || !currentRoom) return;

    const time = player.getCurrentTime();
    player.seekTo(time);

    socket.emit("seek", {
      roomCode: currentRoom,
      time,
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.firstName}
        </h1>
        <UserButton />
      </div>

      <div className="mt-8">
        <button
          onClick={createRoom}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Room
        </button>
      </div>

      <div className="mt-6">
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          className="border px-3 py-2 mr-2"
        />
        <button
          onClick={joinRoom}
          disabled={!roomCode}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Join Room
        </button>
      </div>

      {currentRoom && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">
            Room: {currentRoom}
          </h2>

          <YouTube
            videoId={videoId}
            onReady={onReady}
            opts={{
              width: "100%",
              height: "400",
              playerVars: { autoplay: 0 },
            }}
          />

          <div className="mt-4 flex gap-4">
            <button
              onClick={handlePlay}
              className="bg-green-500 text-white px-4 py-2"
            >
              Play
            </button>

            <button
              onClick={handlePause}
              className="bg-red-500 text-white px-4 py-2"
            >
              Pause
            </button>

            <button
              onClick={handleSeek}
              className="bg-blue-500 text-white px-4 py-2"
            >
              Sync Time
            </button>
          </div>

          <h3 className="mt-4 font-bold">Users in Room:</h3>

          <ul className="mt-2">
            {users.map((u) => (
              <li key={u.socketId} className="p-2 border-b">
                {u.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

