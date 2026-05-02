import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { socket } from "../socket";
import { useChatStore, useRoomStore } from "../store";
import { Send } from "lucide-react";

export const Chat = () => {
  const { user } = useUser();
  const { currentRoom } = useRoomStore();
  const { messages, chatInput, setMessages, addMessage, setChatInput } =
    useChatStore();

  // ========================
  // LISTEN FOR MESSAGES
  // ========================
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      addMessage(msg);

      // Handle commands
      if (msg.text.startsWith("/play ")) {
        const query = msg.text.replace("/play ", "");
        console.log(`Command: search for "${query}"`);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [addMessage]);

  // ========================
  // SEND MESSAGE
  // ========================
  const handleSendMessage = (e) => {
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

  // ========================
  // RENDER
  // ========================
  if (!currentRoom) {
    return (
      <div className="text-slate-400 text-center py-8">
        Join a room to chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 space-y-2 max-h-96 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-slate-400 text-center py-8 text-sm">
            No messages yet. Start chatting!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-pink-400 text-sm font-bold">{msg.user}</p>
              <p className="text-white text-sm break-words">{msg.text}</p>
              <p className="text-slate-400 text-xs mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          placeholder="Type a message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
        />
        <button
          type="submit"
          className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-lg transition"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};