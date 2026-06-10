import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { Send, X, MessageCircle } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const ChatBox = ({ eventId, eventTitle, user, onClose }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const scrollRef = useRef();
  const socketRef = useRef();
  const { token } = useAuth();

  // 1. Create socket connection WITH JWT auth on mount, disconnect on unmount
  useEffect(() => {
    if (!token) return; // Don't connect without a token

    socketRef.current = io.connect(API_URL, {
      auth: { token }, // Pass JWT token for Socket.IO auth middleware
    });

    // Handle connection errors (auth failures)
    socketRef.current.on("connect_error", (err) => {
      console.error("Socket auth error:", err.message);
      toast.error("Chat connection failed. Please re-login.");
    });

    // Handle rate limit / validation errors from server
    socketRef.current.on("error_message", (data) => {
      toast.error(data.message || "Message error");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  // 2. Fetch History & Join Room when eventId changes
  useEffect(() => {
    if (!socketRef.current) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/messages/${eventId}`);
        const history = response.data.map((msg) => ({
          room: msg.eventId,
          userId: msg.senderId,
          author: msg.senderName,
          message: msg.text,
          time: msg.time,
        }));
        setMessageList(history);
      } catch (err) {
        console.error("Error loading chat history", err);
      }
    };

    fetchHistory();
    socketRef.current.emit("join_room", eventId);

    const handleReceive = (data) => {
      // Server now broadcasts to ALL (including sender), so we
      // must avoid duplicating our own messages that we already added optimistically
      setMessageList((prev) => {
        // Deduplicate: if the last message we added locally matches this one, skip
        const lastMsg = prev[prev.length - 1];
        if (
          lastMsg &&
          lastMsg.userId === data.userId &&
          lastMsg.message === data.message &&
          lastMsg.time === data.time
        ) {
          return prev; // Already have it (our optimistic add)
        }
        return [...prev, data];
      });
    };
    socketRef.current.on("receive_message", handleReceive);

    return () => {
      socketRef.current.off("receive_message", handleReceive);
      socketRef.current.emit("leave_room", eventId);
    };
  }, [eventId]);

  // 3. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (currentMessage.trim() !== "") {
      // 500 character limit (matching server validation)
      if (currentMessage.length > 500) {
        toast.error("Message must be 500 characters or less.");
        return;
      }

      const messageData = {
        room: eventId,
        userId: user._id,
        author: user.firstName,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Optimistically add to local state (server will also broadcast)
      setMessageList((list) => [...list, messageData]);
      socketRef.current.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-[60vh] md:h-96 md:w-80 md:bottom-24 md:right-24 bg-white dark:bg-slate-900 shadow-2xl md:rounded-2xl rounded-t-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-[2100] overflow-hidden transition-all animate-in slide-in-from-bottom-10">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 opacity-80" />
          <div>
            <h3 className="font-bold text-sm truncate w-48 md:w-40">
              {eventTitle}
            </h3>
            <p className="text-[10px] text-indigo-100 font-medium">
              Group Chat
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* MESSAGES BODY */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-3">
        {messageList.map((msg, index) => {
          const isMe = msg.userId === user._id;
          return (
            <div
              key={index}
              ref={scrollRef}
              className={`flex flex-col ${
                isMe ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  isMe
                    ? "bg-violet-600 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none"
                }`}
              >
                <p>{msg.message}</p>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                {isMe ? "You" : msg.author} • {msg.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER INPUT */}
      <form
        onSubmit={sendMessage}
        className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 pb-6 md:pb-3"
      >
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          maxLength={500}
          className="w-full p-3 text-sm border-none bg-slate-100 dark:bg-slate-800 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
          onChange={(event) => setCurrentMessage(event.target.value)}
        />
        <button
          type="submit"
          className="bg-violet-600 text-white p-3 rounded-xl hover:bg-violet-700 transition shadow-lg shadow-violet-500/20 active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;