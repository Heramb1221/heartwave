/* eslint-disable @typescript-eslint/no-unused-expressions */
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

type Message = {
  user: string;
  text: string;
};

const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  // User & Premium State
  const [userData, setUserData] = useState<any>(null);

  // Room & Users State
  const [roomCode, setRoomCode] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);

  // Queue & Chat State
  const [queue, setQueue] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Video Player State
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [player, setPlayer] = useState<any>(null);
  const [pendingSync, setPendingSync] = useState<SyncState | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isHost = user?.id === hostId;

  // 💳 Upgrade Handler
  const handleUpgrade = async () => {
    const token = await getToken();

    const res = await fetch("http://localhost:5000/api/payment/create-checkout-session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  // 🎬 Player Ready
  const onReady = (event: any) => setPlayer(event.target);

  // 🧠 Sync logic
  const applySync = (playerInstance: any, state: SyncState) => {
    const { videoId, currentTime, isPlaying } = state;

    setVideoId(videoId);

    setTimeout(() => {
      const drift = Math.abs(playerInstance.getCurrentTime() - currentTime);

      if (drift > 0.5) {
        playerInstance.seekTo(currentTime, true);
      }

      isPlaying
        ? playerInstance.playVideo()
        : playerInstance.pauseVideo();
    }, 300);
  };

  const searchAndAdd = async (query: string) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      );

      const data = await res.json();
      const video = data.items[0];

      if (video) {
        socket.emit("add_to_queue", {
          roomCode: currentRoom,
          video: {
            videoId: video.id.videoId,
            title: video.snippet.title,
          },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleSync = (state: SyncState) => {
      if (!player) {
        setPendingSync(state);
        setVideoId(state.videoId);
        return;
      }
      applySync(player, state);
    };

    socket.on("sync_state", handleSync);
    return () => socket.off("sync_state", handleSync);
  }, [player]);

  useEffect(() => {
    if (!player || !pendingSync) return;
    applySync(player, pendingSync);
    setPendingSync(null);
  }, [videoId, player, pendingSync]);

  // 🔌 Socket setup (Users, Queue, Chat)
  useEffect(() => {
    socket.connect();

    socket.on("room_users", setUsers);
    socket.on("queue_updated", setQueue);

    const handleMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // 🔥 detect suggestion
      if (msg.text.startsWith("/play ")) {
        const query = msg.text.replace("/play ", "");
        searchAndAdd(query);
      }
    });

    return () => {
      socket.off("room_users");
      socket.off("queue_updated");
      socket.off("receive_message", handleMessage);
    };
  }, [currentRoom]);

  // 🔐 Fetch user & premium status
  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();

      const res = await fetch("http://localhost:5000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      setUserData(data);
    };

    fetchUser();
  }, [getToken]);

  // 🔍 Search
  useEffect(() => {
    if (!searchQuery) return;

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);

        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=5&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
        );

        const data = await res.json();
        setResults(data.items || []);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // ➕ Queue
  const addToQueue = (video: any) => {
    if (!currentRoom) return;

    socket.emit("add_to_queue", {
      roomCode: currentRoom,
      video: {
        videoId: video.id.videoId,
        title: video.snippet.title,
      },
    });
  };

  const playFromQueue = (video: any) => {
    if (!currentRoom) return;

    socket.emit("play_from_queue", {
      roomCode: currentRoom,
      video,
    });
  };

  // 💬 Send Message
  const sendMessage = () => {
    if (!chatInput.trim() || !currentRoom) return;

    socket.emit("send_message", {
      roomCode: currentRoom,
      message: {
        user: user?.firstName || "Anonymous",
        text: chatInput,
      },
    });

    setChatInput("");
  };

  // 🏠 Room
  const createRoom = async () => {
    const token = await getToken();

    const res = await fetch("http://localhost:5000/api/room/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setCurrentRoom(data.roomCode);
    setHostId(data.hostId);

    socket.emit("join_room", {
      roomCode: data.roomCode,
      user: {
        name: user?.firstName,
        socketId: socket.id,
      },
    });
  };

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
    setHostId(data.hostId);

    socket.emit("join_room", {
      roomCode: data.roomCode,
      user: {
        name: user?.firstName,
        socketId: socket.id,
      },
    });
  };

  // 🎮 Controls
  const handlePlay = () => {
    if (!player || !currentRoom || !isHost) return;

    const time = player.getCurrentTime();
    player.playVideo();

    socket.emit("play", {
      roomCode: currentRoom,
      videoId,
      time,
      userId: user?.id,
    });
  };

  const handlePause = () => {
    if (!player || !currentRoom || !isHost) return;

    const time = player.getCurrentTime();
    player.pauseVideo();

    socket.emit("pause", { roomCode: currentRoom, time });
  };

  const handleSeek = () => {
    if (!player || !currentRoom || !isHost) return;

    const time = player.getCurrentTime();
    player.seekTo(time);

    socket.emit("seek", { roomCode: currentRoom, time });
  };

  const onStateChange = (event: any) => {
    if (event.data === 0 && currentRoom) {
      socket.emit("song_ended", { roomCode: currentRoom });
    }
  };

  // 🔒 Premium Paywall early return
  if (userData && !userData.isPremium) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1>
          <UserButton />
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border rounded-lg space-y-6">
          <p className="text-xl font-medium text-gray-700">
            Upgrade to use Karaoke mode
          </p>
          <button
            onClick={handleUpgrade}
            className="bg-yellow-500 text-white px-6 py-3 rounded shadow hover:bg-yellow-600 transition font-semibold"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  // 🎤 Main Application (Premium users only)
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.firstName}
        </h1>
        <UserButton />
      </div>

      {/* Room Controls */}
      <div>
        <button onClick={createRoom} className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Room
        </button>

        <div className="mt-3">
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Room Code"
            className="border px-2 py-1 mr-2 rounded"
          />
          <button onClick={joinRoom} className="bg-green-500 text-white px-4 py-2 rounded">
            Join
          </button>
        </div>
      </div>

      {currentRoom && (
        <>
          <div className="p-3 bg-gray-100 rounded flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Room Code</p>
              <p className="font-bold text-lg">{currentRoom}</p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(currentRoom);
              }}
              className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition"
            >
              Copy
            </button>
          </div>
          
          {/* YouTube Player */}
          <div className="aspect-video w-full">
            <YouTube 
              videoId={videoId} 
              onReady={onReady} 
              onStateChange={onStateChange} 
              opts={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Video Controls */}
          <div className="flex gap-3">
            <button
              onClick={handlePlay}
              disabled={!isHost}
              className={`px-4 py-2 rounded text-white ${
                isHost ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Play
            </button>

            <button 
              onClick={handlePause} 
              disabled={!isHost}
              className={`px-4 py-2 rounded text-white ${
                isHost ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Pause
            </button>

            <button 
              onClick={handleSeek} 
              disabled={!isHost}
              className={`px-4 py-2 rounded text-white ${
                isHost ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Sync
            </button>
          </div>

          {/* Now Playing */}
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Now Playing</p>
            <p className="font-semibold">{videoId}</p>
          </div>

          {/* Search */}
          <div className="space-y-3">
            <input
              placeholder="Search songs on YouTube..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border px-3 py-2 w-full rounded"
            />

            {isSearching && <p className="text-sm text-gray-500">Searching...</p>}
            {!isSearching && results.length === 0 && searchQuery && (
              <p className="text-sm text-gray-500">No results found</p>
            )}

            <div className="space-y-2">
              {results.map((video) => (
                <div key={video.id.videoId} className="flex justify-between items-center p-2 bg-gray-50 border rounded">
                  <span className="truncate pr-4">{video.snippet.title}</span>
                  <button 
                    onClick={() => addToQueue(video)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Layout for Queue and Chat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Queue */}
            <div className="border p-4 rounded bg-gray-50">
              <h2 className="font-bold text-lg mb-3">Queue</h2>

              {queue.length === 0 && (
                <p className="text-gray-500 text-sm">No songs yet</p>
              )}

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {queue.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 border bg-white rounded">
                    <span className="text-sm truncate pr-2">{item.title}</span>

                    {isHost && (
                      <button 
                        onClick={() => playFromQueue(item)}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                      >
                        Play
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="border p-4 rounded bg-gray-50 flex flex-col h-full">
              <h2 className="font-bold text-lg mb-3">Room Chat</h2>
              
              <div className="flex-1 h-40 overflow-y-auto border bg-white rounded p-2 mb-3">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">No messages yet...</p>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className="mb-1 text-sm">
                      <b className="text-blue-600">{msg.user}: </b> 
                      <span className="text-gray-800">{msg.text}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message or /play..."
                  className="border px-2 py-1 flex-1 rounded text-sm"
                />
                <button 
                  onClick={sendMessage}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="border p-4 rounded bg-gray-50 mt-6">
            <h2 className="font-bold text-lg mb-3">Users in Room</h2>
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u.socketId} className="flex justify-between items-center p-2 bg-white border rounded text-sm">
                  <span className="font-medium">{u.name}</span>
                  
                  <div className="flex gap-2 text-xs">
                    {u.name === user?.firstName && <span className="bg-gray-200 px-2 py-1 rounded">You</span>}
                    {u.name === users[0]?.name && <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Host</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;