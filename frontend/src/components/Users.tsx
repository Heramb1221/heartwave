import { useState, useEffect } from "react";
import { socket } from "../socket";
import { useRoomStore } from "../store";

interface RoomUser {
  socketId: string;
  clerkId: string;
  name: string;
  avatar?: string;
}

export const Users = () => {
  const { users, setUsers, hostId } = useRoomStore();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const handle = (u: RoomUser[]) => setUsers(u);
    socket.on("room_users", handle);
    return () => { socket.off("room_users", handle); };
  }, [setUsers]);

  if (users.length === 0) return null;

  const AV_COLORS = ["av-coral", "av-violet", "av-teal", "av-pink"];

  return (
    <div className="sidebar-members">
      <div className="members-toggle" onClick={() => setOpen(!open)}>
        <div className="members-toggle-title">
          Members
          <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
            ({users.length})
          </span>
        </div>
        <span className={`members-chevron${open ? " open" : ""}`}>▼</span>
      </div>

      {open && (
        <div className="members-list">
          {(users as RoomUser[]).map((u, i) => {
            const isHost = u.clerkId === hostId;
            return (
              <div key={u.socketId} className="member-row">
                <div className={`member-av avatar ${AV_COLORS[i % AV_COLORS.length]}`} style={{ width: 28, height: 28, fontSize: "0.62rem" }}>
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    u.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="member-name">
                  {u.name}
                  {isHost && <span className="badge badge-host" style={{ fontSize: "0.58rem", padding: "1px 6px" }}>👑 Host</span>}
                </div>
                <div className="member-icons">
                  <span className="m-ico on">🎤</span>
                  <span className="m-ico on">📷</span>
                </div>
                <div className="online-dot" style={{ width: 7, height: 7 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
