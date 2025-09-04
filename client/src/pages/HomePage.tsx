import { useState, useEffect, type ChangeEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatRoom from "../components/ChatRoom";

type Room = {
  _id: string;
  name: string;
};

export default function HomePage() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  if (!BACKEND_URL) throw new Error("VITE_BACKEND_URL not defined");
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState<string>("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get<Room[]>(`${BACKEND_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const { data } = await axios.post<Room>(
        `${BACKEND_URL}/api/rooms`,
        { name: newRoomName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRooms((prev) => [...prev, data]);
      setNewRoomName("");
    } catch (err) {
      console.error("Failed to create room:", err);
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/rooms/${roomId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedRoom(roomId);
    } catch (err) {
      console.error("Failed to join room:", err);
    }
  };

  const handleNewRoomChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewRoomName(e.target.value);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/");
  };

  if (selectedRoom) {
    return (
      <ChatRoom
        roomId={selectedRoom}
        token={token as string}
        onLeave={() => setSelectedRoom(null)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Rooms</h1>
        <button onClick={logout} className="text-red-500">
          Logout
        </button>
      </div>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="New room name"
          value={newRoomName}
          onChange={handleNewRoomChange}
          className="border p-2 flex-1 rounded mr-2"
        />
        <button
          onClick={createRoom}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Create
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto border rounded p-2">
        {rooms.map((room) => (
          <li
            key={room._id}
            className="flex justify-between items-center mb-2 p-2 border rounded hover:bg-gray-100"
          >
            <span>{room.name}</span>
            <button
              onClick={() => joinRoom(room._id)}
              className="text-blue-500"
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
