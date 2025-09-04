import { type ChangeEvent } from "react";

type Room = {
  _id: string;
  name: string;
};

interface RoomListProps {
  rooms: Room[];
  newRoomName: string;
  onNewRoomChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

export default function RoomList({
  rooms,
  newRoomName,
  onNewRoomChange,
  onCreateRoom,
  onJoinRoom,
}: RoomListProps) {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="New room name"
          value={newRoomName}
          onChange={onNewRoomChange}
          className="border p-2 flex-1 rounded mr-2"
        />
        <button
          onClick={onCreateRoom}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Create
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto border rounded p-2">
        {rooms.length === 0 && (
          <p className="text-gray-500 text-center">No rooms yet</p>
        )}
        {rooms.map((room) => (
          <li
            key={room._id}
            className="flex justify-between items-center mb-2 p-2 border rounded hover:bg-gray-100"
          >
            <span>{room.name}</span>
            <button
              onClick={() => onJoinRoom(room._id)}
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
