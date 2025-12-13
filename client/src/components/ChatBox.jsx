import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Send, X, MessageCircle } from "lucide-react"; // Better icons

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL; 

const socket = io.connect(API_URL);

const ChatBox = ({ eventId, eventTitle, user, onClose }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const scrollRef = useRef(); 
  const token = localStorage.getItem("token");

  // 1. Fetch History & Join Room
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/messages/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const history = response.data.map(msg => ({
                room: msg.eventId,
                author: msg.senderName,
                message: msg.text,
                time: msg.time
            }));
            setMessageList(history);
        } catch (err) {
            console.error("Error loading chat history", err);
        }
    };

    fetchHistory();
    socket.emit("join_room", eventId);

    const handleReceive = (data) => {
        setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [eventId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (currentMessage !== "") {
      const messageData = {
        room: eventId,
        userId: user._id, 
        author: user.firstName,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]); 
      setCurrentMessage("");
    }
  };

  return (
    // 🟢 UPDATED CONTAINER CLASSES FOR MOBILE RESPONSIVENESS
    <div className="fixed bottom-0 left-0 w-full h-[60vh] md:h-96 md:w-80 md:bottom-24 md:right-24 bg-white dark:bg-slate-900 shadow-2xl md:rounded-2xl rounded-t-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-[2100] overflow-hidden transition-all animate-in slide-in-from-bottom-10">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 opacity-80" />
            <div>
                <h3 className="font-bold text-sm truncate w-48 md:w-40">{eventTitle}</h3>
                <p className="text-[10px] text-indigo-100 font-medium">Group Chat</p>
            </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
            <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* MESSAGES BODY */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-3">
        {messageList.map((msg, index) => {
           const isMe = msg.author === user.firstName;
           return (
            <div key={index} ref={scrollRef} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    isMe 
                    ? "bg-violet-600 text-white rounded-br-none" 
                    : "bg-white dark:bg-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none"
                }`}>
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
      <form onSubmit={sendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 pb-6 md:pb-3">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          className="w-full p-3 text-sm border-none bg-slate-100 dark:bg-slate-800 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition"
          onChange={(event) => setCurrentMessage(event.target.value)}
        />
        <button type="submit" className="bg-violet-600 text-white p-3 rounded-xl hover:bg-violet-700 transition shadow-lg shadow-violet-500/20 active:scale-95">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;