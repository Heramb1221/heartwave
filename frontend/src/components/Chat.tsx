import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { socket } from "../socket";
import { useChatStore, useRoomStore } from "../store";

export const Chat = () => {
  const { user } = useUser();
  const { currentRoom } = useRoomStore();
  const { messages, chatInput, addMessage, setChatInput } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleReceiveMessage = (msg: { user: string; text: string; timestamp: string }) => {
      addMessage(msg);
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => { socket.off("receive_message", handleReceiveMessage); };
  }, [addMessage]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
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

  if (!currentRoom) return null;

  const AV_COLORS = ["av-coral", "av-violet", "av-teal", "av-pink"];

  return (
    <div className="chat-dock">
      <div className="chat-resize-handle" />

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">No messages yet — say hello 👋</div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.user === (user?.firstName || "Anonymous");
            const avColor = isMe ? "av-coral" : AV_COLORS[idx % AV_COLORS.length];
            return (
              <div key={idx} className="chat-msg">
                <div className={`chat-msg-av avatar ${avColor}`} style={{ fontSize: "0.62rem" }}>
                  {msg.user.substring(0, 2).toUpperCase()}
                </div>
                <div className="chat-msg-body">
                  <div className="chat-msg-meta">
                    <span
                      className="chat-msg-name"
                      style={{ color: isMe ? "var(--coral)" : "var(--violet-soft)" }}
                    >
                      {msg.user}
                    </span>
                    <span className="chat-msg-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isMe && <span className="chat-msg-you">you</span>}
                  </div>
                  <div className="chat-msg-text">{msg.text}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-form" onSubmit={handleSend}>
        <input
          className="chat-input"
          placeholder="Message the room… or /play <song>"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
        />
        <button type="submit" className="chat-send-btn" title="Send">➤</button>
        <div className="chat-dock-btn mic-on" title="Mute / Unmute">🎤</div>
        <div className="chat-dock-btn" title="Camera">📷</div>
        <div className="chat-dock-btn" title="Settings">⚙️</div>
      </form>
    </div>
  );
};
