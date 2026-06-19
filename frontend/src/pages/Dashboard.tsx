import { useState, useEffect } from "react";
import { useUser, useAuth, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { useRoomStore, useAuthStore } from "../store";
import { Player } from "../components/Player";
import { Controls } from "../components/Controls";
import { Search } from "../components/Search";
import { Queue } from "../components/Queue";
import { Chat } from "../components/Chat";
import { Users } from "../components/Users";
import { UpgradeModal } from "../components/UpgradeModal";
import "./Dashboard.css";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const { currentRoom, setCurrentRoom, setHostId, setUsers } = useRoomStore();
  const { userData, setUserData } = useAuthStore();

  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  // ── Fetch user data ──
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Fetch user error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [getToken, setUserData]);

  // ── Socket lifecycle ──
  useEffect(() => {
    socket.connect();
    return () => { socket.disconnect(); };
  }, []);

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

  // ── Create room ──
  const createRoom = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/room/create`, {
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

  // ── Join room ──
  const joinRoom = async () => {
    if (!roomCode.trim()) { alert("Enter a room code"); return; }
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/room/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roomCode }),
      });
      const data = await res.json();
      if (!data.roomCode) { alert("Room not found"); return; }
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

  // ── Leave room ──
  const handleLeaveRoom = () => {
    socket.emit("leave_room", { roomCode: currentRoom });
    setCurrentRoom(null);
  };

  // ── Copy code ──
  const handleCopyCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2200);
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="dash-loading">
        <div className="dash-loading-icon">🎧</div>
        <p>Loading Melodies…</p>
      </div>
    );
  }

  // ── Lobby (no room) ──
  if (!currentRoom) {
    return (
      <>
        {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}

        {/* Navbar */}
        <nav className="dash-nav" style={{ position: "sticky", top: 0 }}>
          <div className="dash-nav-left">
            <div className="nav-logo" onClick={() => navigate("/")}>
              <div className="nav-logo-icon">🎧</div>
              Melodies
            </div>
          </div>
          <div className="dash-nav-right">
            {userData && !userData.isPremium && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowUpgradeModal(true)}>
                ⭐ Upgrade
              </button>
            )}
            {userData?.isPremium && (
              <span className="badge badge-premium">⭐ Premium</span>
            )}
            <div style={{ display: "flex", alignItems: "center" }}>
              <UserButton />
            </div>
          </div>
        </nav>

        {/* Lobby */}
        <div className="dash-lobby" style={{ height: "calc(100vh - 64px)" }}>
          <div className="lobby-card">
            <div className="lobby-icon">🎵</div>
            <div className="lobby-title">Start Listening Together</div>
            <div className="lobby-desc">
              Create a room and invite friends, or join an existing one with a six-character code.
            </div>
            <button className="lobby-create-btn" onClick={createRoom}>
              ▶ &nbsp; Create Room
            </button>
            <div className="lobby-join-row">
              <input
                className="lobby-join-input"
                placeholder="Enter room code…"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && joinRoom()}
                maxLength={6}
              />
              <button className="lobby-join-btn" onClick={joinRoom}>Join</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── In Room ──
  return (
    <>
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}

      {/* Toast */}
      {copyToast && (
        <div className="toast-stack">
          <div className="toast-item">
            <div className="toast-dot-green" />
            <span style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Room code</strong> copied to clipboard
            </span>
          </div>
        </div>
      )}

      <div className="dash-root">
        {/* NAVBAR */}
        <nav className="dash-nav">
          <div className="dash-nav-left">
            <div className="nav-logo" onClick={() => navigate("/")}>
              <div className="nav-logo-icon">🎧</div>
              Melodies
            </div>
            <div className="room-chip" onClick={handleCopyCode} title="Click to copy">
              🔗 &nbsp;HW-{currentRoom}
            </div>
          </div>

          <div className="dash-nav-center">
            <input
              className="room-name-input"
              defaultValue="Jam Session"
              onBlur={e => { if (!e.target.value.trim()) e.target.value = "Jam Session"; }}
            />
            <span className="nav-edit-icon">✎</span>
          </div>

          <div className="dash-nav-right">
            <button className="btn btn-sm" onClick={handleCopyCode}>
              🔗 Invite
            </button>
            {userData && !userData.isPremium && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowUpgradeModal(true)}>
                ⭐ Upgrade
              </button>
            )}
            {userData?.isPremium && (
              <span className="badge badge-premium">⭐ Premium</span>
            )}
            <button
              className="btn btn-sm"
              style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.25)" }}
              onClick={handleLeaveRoom}
            >
              Leave
            </button>
            <div style={{ display: "flex", alignItems: "center" }}>
              <UserButton />
            </div>
          </div>
        </nav>

        {/* BODY */}
        <div className="dash-body">
          {/* PLAYER COLUMN */}
          <div className="player-col">
            <div className="karaoke-pill">
              <div className="karaoke-dot" />
              Karaoke
            </div>
            <div className="player-card">
              <Player />
              <Controls />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="sidebar">
            <Search />
            <Queue />
            <Users />
          </div>
        </div>

        {/* CHAT DOCK */}
        <Chat />
      </div>
    </>
  );
};

export default Dashboard;
