import { useEffect } from "react";
import { socket } from "../socket";
import { useQueueStore, useRoomStore, usePlayerStore } from "../store";
import { useUser } from "@clerk/clerk-react";
import type { QueueVideo } from "../store";

export const Queue = () => {
  const { queue, setQueue } = useQueueStore();
  const { currentRoom, hostId } = useRoomStore();
  const { videoId: currentVideoId } = usePlayerStore();
  const { user } = useUser();
  const isHost = user?.id === hostId;

  useEffect(() => {
    const handle = (q: QueueVideo[]) => setQueue(q);
    socket.on("queue_updated", handle);
    return () => { socket.off("queue_updated", handle); };
  }, [setQueue]);

  const playFromQueue = (videoId: string) => {
    if (!currentRoom || !isHost) return;
    socket.emit("play_from_queue", { roomCode: currentRoom, videoId, userId: hostId });
  };

  const removeFromQueue = (videoId: string) => {
    if (!currentRoom) return;
    setQueue(queue.filter(v => v.videoId !== videoId));
  };

  return (
    <div className="sidebar-queue">
      <div className="sidebar-section-header">
        <div className="sidebar-section-title">Up Next</div>
        <div className="sidebar-section-count">{queue.length}</div>
      </div>

      {queue.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎵</div>
          <div className="empty-state-text">Queue is empty<br />Search above to add songs</div>
        </div>
      ) : (
        queue.map(video => {
          const active = video.videoId === currentVideoId;
          return (
            <div key={video.videoId} className={`queue-item${active ? " active" : ""}`}>
              {video.thumbnail ? (
                <img className="queue-thumb" src={video.thumbnail} alt="" />
              ) : (
                <div className="queue-thumb">🎵</div>
              )}
              <div className="queue-info">
                <div className="queue-title">{video.title}</div>
                <div className="queue-by">{active ? "Now playing" : "In queue"}</div>
              </div>
              <div className="queue-actions">
                {isHost && !active && (
                  <div
                    className="q-btn"
                    onClick={() => playFromQueue(video.videoId)}
                    title="Play now"
                  >▶</div>
                )}
                <div
                  className="q-btn q-btn-danger"
                  onClick={() => removeFromQueue(video.videoId)}
                  title="Remove"
                >✕</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
