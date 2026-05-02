/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useUser, useAuth, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import {
  useRoomStore,
  useAuthStore,
  useUIStore,
  usePlayerStore,
  useQueueStore,
  useChatStore,
} from "../store";
import { Player } from "../components/Player";
import { Controls } from "../components/Controls";
import { Search } from "../components/Search";
import { Queue } from "../components/Queue";
import { Chat } from "../components/Chat";
import { Users } from "../components/Users";
import { Menu, X, LogOut } from "lucide-react";

const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // ========================
  // STORE HOOKS
  // ========================
  const { currentRoom, setCurrentRoom, setHostId, setUsers, hostId } =
    useRoomStore();
  const { userData, setUserData } = useAuthStore();
  const { isSidebarOpen, setIsSidebarOpen } = useUIStore();
  const { resetPlayer } = usePlayerStore();
  const { resetQueue } = useQueueStore();
  const { resetChat } = useChatStore();

  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ========================
  // FETCH USER DATA
  // ========================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setUserData(data);

        // if (!data.isPremium) {
        //   // Redirect to upgrade
        //   navigate("/upgrade");
        // }
      } catch (error) {
        console.error("Fetch user error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [getToken, setUserData, navigate]);

  // ========================
  // SOCKET CONNECTION
  // ========================
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  // ========================
  // SOCKET LISTENERS
  // ========================
  useEffect(() => {
    socket.on("room_users", setUsers);
    socket.on("error", (error) => {
      console.error("Socket error:", error);
      alert(error.message);
    });

    return () => {
      socket.off("room_users");
      socket.off("error");
    };
  }, [setUsers]);

  // ========================
  // CREATE ROOM
  // ========================
  const createRoom = async () => {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/room/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setCurrentRoom(data.roomCode);
      setHostId(user?.id);

      socket.emit("join_room", {
        roomCode: data.roomCode,
        user: {
          clerkId: user?.id,
          name: user?.firstName || "Anonymous",
          avatar: user?.imageUrl,
        },
      });
    } catch (error) {
      console.error("Create room error:", error);
      alert("Failed to create room");
    }
  };

  // ========================
  // JOIN ROOM
  // ========================
  const joinRoom = async () => {
    if (!roomCode.trim()) {
      alert("Enter a room code");
      return;
    }

    try {
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
      if (!data.roomCode) {
        alert("Room not found");
        return;
      }

      setCurrentRoom(data.roomCode);
      setHostId(data.hostId);

      socket.emit("join_room", {
        roomCode: data.roomCode,
        user: {
          clerkId: user?.id,
          name: user?.firstName || "Anonymous",
          avatar: user?.imageUrl,
        },
      });

      setRoomCode("");
    } catch (error) {
      console.error("Join room error:", error);
      alert("Failed to join room");
    }
  };

  // ========================
  // LOGOUT
  // ========================
  const handleLogout = () => {
    socket.disconnect();
    resetPlayer();
    resetQueue();
    resetChat();
    setCurrentRoom(null);
  };

  // ========================
  // LOADING
  // ========================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="text-4xl">🎵</span>
          </div>
          <p className="text-white">Loading HeartWave...</p>
        </div>
      </div>
    );
  }

  // ========================
  // RENDER
  // ========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-950">
      {/* Top Bar */}
      <div className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white hover:bg-slate-700 p-2 rounded-lg transition"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-white font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
              HeartWave
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">
              👤 {user?.firstName || "User"}
            </span>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="lg:col-span-1 space-y-4">
            {/* Controls */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700">
              <Controls
                onCreateRoom={createRoom}
                onJoinRoom={joinRoom}
                roomCode={roomCode}
                setRoomCode={setRoomCode}
              />
            </div>

            {/* Users */}
            {currentRoom && (
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700">
                <Users />
              </div>
            )}

            {/* Search */}
            {currentRoom && (
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700">
                <Search />
              </div>
            )}
          </div>
        )}

        {/* Main Player Area */}
        <div className={`${isSidebarOpen ? "lg:col-span-2" : "lg:col-span-3"} space-y-4`}>
          {/* Player */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700">
            <Player />
          </div>

          {/* Queue */}
          {currentRoom && (
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700">
              <Queue />
            </div>
          )}
        </div>

        {/* Right Sidebar - Chat */}
        {currentRoom && (
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700 h-full flex flex-col">
              <Chat />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-md mt-4">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex justify-between items-center text-xs text-slate-400">
          <span>🎵 HeartWave © 2024</span>
          <span>
            {currentRoom
              ? `Connected to ${currentRoom}`
              : "Not connected to any room"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;