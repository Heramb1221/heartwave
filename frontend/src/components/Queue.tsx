/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from "react";
import { socket } from "../socket";
import { useQueueStore, useRoomStore } from "../store";
import { Play, Trash2 } from "lucide-react";

export const Queue = () => {
  const { queue, setQueue } = useQueueStore();
  const { currentRoom, hostId } = useRoomStore();

  // ========================
  // LISTEN FOR QUEUE UPDATES
  // ========================
  useEffect(() => {
    const handleQueueUpdate = (newQueue: any) => {
      setQueue(newQueue);
    };

    socket.on("queue_updated", handleQueueUpdate);
    return () => socket.off("queue_updated", handleQueueUpdate);
  }, [setQueue]);

  // ========================
  // PLAY FROM QUEUE
  // ========================
  const playFromQueue = (videoId: any) => {
    if (!currentRoom) return;

    socket.emit("play_from_queue", {
      roomCode: currentRoom,
      videoId,
      userId: hostId,
    });
  };

  // ========================
  // REMOVE FROM QUEUE
  // ========================
  const removeFromQueue = (videoId: any) => {
    if (!currentRoom) return;

    // Optimistic update
    const newQueue = queue.filter((v: { videoId: any; }) => v.videoId !== videoId);
    setQueue(newQueue);
  };

  // ========================
  // RENDER
  // ========================
  if (!currentRoom) {
    return (
      <div className="text-slate-400 text-center py-8">
        Join a room to see the queue
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-white font-bold text-lg">🎵 Queue</h3>

      {queue.length === 0 ? (
        <div className="text-slate-400 text-center py-8 text-sm">
          Queue is empty. Add some songs!
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {queue.map((video: { videoId: Key | null | undefined; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, idx: number) => (
            <div
              key={video.videoId}
              className="flex gap-3 bg-slate-700/50 p-3 rounded-lg hover:bg-slate-600/50 transition group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {idx + 1}. {video.title}
                </p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                {hostId && (
                  <button
                    onClick={() => playFromQueue(video.videoId)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition"
                  >
                    <Play size={16} />
                  </button>
                )}
                <button
                  onClick={() => removeFromQueue(video.videoId)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};