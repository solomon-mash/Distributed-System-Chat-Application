import React, { useEffect, useState } from "react";
import API from "../utils/api";

export default function Sidebar({ socket, onSelectUser, selectedUser }) {
  const [users, setUsers] = useState([]);
  const [onlineIds, setOnlineIds] = useState([]);

  useEffect(() => {
    // load users
    async function load() {
      try {
        const res = await API.get("/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed fetching users", err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("users", (ids) => {
      setOnlineIds(ids);
    });
    return () => socket.off("users");
  }, [socket]);

  return (
    <div className="w-80 border-r bg-white flex flex-col">
      <div className="p-4 border-b font-semibold">Chat Rooms</div>
      <div className="flex-1 overflow-auto">
        <div 
          onClick={() => onSelectUser({ _id: "global", username: "Group Chat" })}
          className={`p-3 cursor-pointer hover:bg-blue-100 rounded-md flex items-center gap-3 ${
            selectedUser?._id === "global" ? "bg-blue-200" : ""
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-300`}>
          G    
          </div>
           Group Chat
        </div>

        {users.map((u) => {
          const isOnline = onlineIds.includes(u._id);
          return (
            <div key={u._id} onClick={() => onSelectUser(u)} className={`p-3 cursor-pointer hover:bg-slate-50 flex items-center gap-3 ${selectedUser?._id === u._id ? "bg-slate-100" : ""}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOnline ? "bg-green-400" : "bg-gray-300"}`}>
                {u.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium">{u.username}</div>
                <div className="text-xs text-gray-500">{isOnline ? "online" : "offline"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
