import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { io, Socket } from "socket.io-client";

type Message = {
  _id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
};

type TypingPayload = {
  userId: string;
  name: string;
  isTyping: boolean;
};

interface ChatRoomProps {
  roomId: string;
  token: string;
  onLeave: () => void;
}

export default function ChatRoom({ roomId, token, onLeave }: ChatRoomProps) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  if (!BACKEND_URL) throw new Error("VITE_BACKEND_URL not defined");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket: Socket = io(BACKEND_URL, {
      auth: { token },
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      setTimeout(() => {
        socket.emit("joinRoom", roomId);
      }, 100);
      console.log(roomId);
      console.log("emit joinRoom");
    });

    socket.on("onlineUsers", (onlineUsersArr: string[]) => {
      setOnlineUsers(onlineUsersArr);
    });

    socket.on("previousMessages", (msgs: Message[]) => {
      console.log(msgs);
      setMessages(msgs);
    });

    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", ({ name, isTyping }: TypingPayload) => {
      setTypingUsers((prev) => {
        if (isTyping && !prev.includes(name)) return [...prev, name];
        if (!isTyping) return prev.filter((n) => n !== name);
        return prev;
      });
    });

    setInterval(() => {
      setTypingUsers([]);
    }, 3000);

    return () => {
      socket.disconnect();
    };
  }, [roomId, token]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socketRef.current?.emit("sendMessage", { roomId, text });
    setText("");
  };

  const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    socketRef.current?.emit("typing", { roomId, isTyping: value.length > 0 });
  };

  return (
    <div className="h-screen flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Room Chat</h2>
        <button onClick={onLeave} className="text-red-500">
          Leave
        </button>
      </div>
      <div>
        Online users:{" "}
        {onlineUsers.map((i) => (
          <span>{i + " "}</span>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto border p-2 mb-2">
        {messages.map((msg) => (
          <div key={msg._id} className="mb-1">
            <strong>{msg.senderName}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {typingUsers.length > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {typingUsers.join(", ")} typing...
        </div>
      )}

      <div className="flex">
        <input
          type="text"
          value={text}
          onChange={handleTyping}
          className="border p-2 flex-1 rounded mr-2"
          placeholder="Type a message"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
