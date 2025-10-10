import React, { useEffect, useState, useRef } from "react";
import API from "../utils/api";

export default function ChatWindow({ socket, currentUser, targetUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const endRef = useRef(null);
  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setMessages([]);
    if (!targetUser?._id) return;

    async function load() {
      try {
        const url =
          targetUser._id === "global"
            ? "/api/messages"
            : `/api/messages/${targetUser._id}`;

        const res = await API.get(url, { headers: { Authorization: `Bearer ${token}` } });

        const normalized = res.data.map((m) => ({
          ...m,
          from: m.sender?._id?.toString() || m.sender?.toString(),
          to: m.receiver?._id?.toString() || m.receiver?.toString(),
        }));

        setMessages(normalized);
      } catch (err) {
        console.error("Failed loading history", err);
      }
    }

    load();
  }, [targetUser]);

  useEffect(() => {
    if (!socket) return;

    const privateHandler = (msg) => {
      if (!targetUser?._id || targetUser._id === "global") return;
      const normalized = {
        ...msg,
        from: msg.sender?._id?.toString() || msg.sender?.toString(),
        to: msg.receiver?._id?.toString() || msg.receiver?.toString(),
      };
      const relevant =
        normalized.from === targetUser._id || normalized.to === targetUser._id;
      if (relevant) setMessages((p) => [...p, normalized]);
    };
    const groupHandler = (msg) => {
  const normalized = {
    ...msg,
    from: msg.sender?._id?.toString() || msg.sender?.toString(),
  };
  setMessages((p) => [...p, normalized]);
};
    socket.on("privateMessage", privateHandler);
    socket.on("groupMessage", groupHandler);

    return () => {
      socket.off("privateMessage", privateHandler);
      socket.off("groupMessage", groupHandler);
    };
  }, [socket, targetUser]);

useEffect(() => {
  if (!endRef.current) return;
  endRef.current.scrollIntoView({ behavior: "smooth" });
}, [messages]);

  const send = () => {
    if (!text.trim() || !socket || !targetUser?._id) return;

    const payload = { text };
    if (targetUser._id === "global") {
      socket.emit("groupMessage", payload);
  } else {
      socket.emit("privateMessage", { to: targetUser._id, text });
    }
    setText("");
  };

  if (!targetUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  const grouped = messages.reduce((acc, m) => {
    const k = new Date(m.createdAt).toDateString();
    if (!acc[k]) acc[k] = [];
    acc[k].push(m);
    return acc;
  }, {});
  const dateKeys = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  return (
  <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-slate-100">
    {/* Chat messages container */}
    <div
      ref={listRef}
      className="flex-1 overflow-auto p-4 min-h-0"
    >
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          Start chatting today ✨
        </div>
      ) : (
        dateKeys.map((dateKey) => (
          <div key={dateKey}>
            <div className="text-center text-xs text-gray-500 my-4">
              <span className="bg-slate-200 px-3 py-1 rounded-full shadow-sm">
                {formatDateHeader(dateKey)}
              </span>
            </div>

            {grouped[dateKey].map((m, idx) => {
              const mine = m.from === (currentUser._id || currentUser.id);
              const senderName =
                targetUser._id === "global"
                  ? mine
                    ? "You"
                    : m.sender?.username || "Unknown"
                  : null;

              return (
                <div key={idx} className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md ${
                      mine
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-gray-800 border rounded-tl-none"
                    }`}
                  >
                    {senderName && (
                      <div className="text-xs font-semibold mb-1 text-blue-600">
                        {senderName}
                      </div>
                    )}
                    <div className="text-sm leading-relaxed">{m.text}</div>
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        mine ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
      <div id="chat-end" ref={endRef}></div>
    </div>

    {/* Input area */}
    <div className="flex-none bg-white border-t p-3">
      <div className="max-w-full flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder={
            targetUser._id === "global"
              ? "Message everyone in the group"
              : `Message ${targetUser.username}`
          }
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={send}
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  </div>
);
}