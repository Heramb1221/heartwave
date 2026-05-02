import { useEffect } from "react";
import { socket } from "../socket";
import { useRoomStore } from "../store";
import { Users as UsersIcon, Crown } from "lucide-react";

export const Users = () => {
  const { users, setUsers, hostId } = useRoomStore();

  // ========================
  // LISTEN FOR USER UPDATES
  // ========================
  useEffect(() => {
    const handleRoomUsers = (newUsers) => {
      setUsers(newUsers);
    };

    const handleUserJoined = ({ name, count }) => {
      console.log(`${name} joined! (${count} users)`);
    };

    socket.on("room_users", handleRoomUsers);
    socket.on("user_joined", handleUserJoined);

    return () => {
      socket.off("room_users", handleRoomUsers);
      socket.off("user_joined", handleUserJoined);
    };
  }, [setUsers]);

  // ========================
  // RENDER
  // ========================
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <UsersIcon size={20} className="text-pink-400" />
        <h3 className="text-white font-bold text-lg">
          Users ({users.length})
        </h3>
      </div>

      {users.length === 0 ? (
        <div className="text-slate-400 text-sm">No users in room</div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.socketId}
              className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg hover:bg-slate-600/50 transition"
            >
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {user.name}
                  {user.clerkId === hostId && (
                    <span className="ml-2">
                      <Crown size={14} className="inline text-yellow-400" />
                    </span>
                  )}
                </p>
                <p className="text-slate-400 text-xs">
                  {user.socketId.slice(0, 8)}...
                </p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};