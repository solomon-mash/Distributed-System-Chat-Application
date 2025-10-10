import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { createSocket } from "../utils/socket";

export default function Chat() {
  const { user, logout } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = createSocket();
    setSocket(s);
    return () => s && s.disconnect();
  }, []);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100">
      <div className="w-80 border-r bg-white flex-shrink-0 flex flex-col">
        <Sidebar
          socket={socket}
          onSelectUser={setSelectedUser}
          selectedUser={selectedUser}
        />
      </div>

      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Header Bar */}
        <div className="bg-blue-600 text-white p-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="font-semibold text-lg">Chat</div>
            {selectedUser && (
              <div className="text-sm opacity-80">
                with {selectedUser.username}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm opacity-80">You: {user.username}</div>
            <button
              onClick={logout}
              className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatWindow
            socket={socket}
            currentUser={user}
            targetUser={selectedUser}
          />
        </div>
      </div>
    </div>
  );
}
