import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io.connect("http://localhost:5000");

const ChatBox = ({ eventId, eventTitle, user, onClose }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const scrollRef = useRef(); // To auto-scroll to bottom
  const token = localStorage.getItem("token");

  // 1. Fetch History & Join Room
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/messages/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Map DB format to UI format if needed, or keep consistent
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

    // Setup Listener
    const handleReceive = (data) => {
        setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [eventId]);

  // Auto-scroll when messageList changes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: eventId,
        userId: user._id, // Needed for DB
        author: user.firstName,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]); // Add locally for instant UI
      setCurrentMessage("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 shadow-2xl rounded-t-lg border border-gray-200 dark:border-gray-600 flex flex-col z-50 h-96">
      
      {/* HEADER */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center cursor-pointer" onClick={onClose}>
        <h3 className="font-bold text-sm truncate w-60">Chat: {eventTitle}</h3>
        <button className="text-white hover:text-gray-200 font-bold">✕</button>
      </div>

      {/* MESSAGES BODY */}
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50 dark:bg-gray-700 flex flex-col gap-2">
        {messageList.map((msg, index) => {
           const isMe = msg.author === user.firstName;
           return (
            <div key={index} ref={scrollRef} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${isMe ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-600 dark:text-white"}`}>
                    <p>{msg.message}</p>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                    {msg.author} • {msg.time}
                </div>
            </div>
           );
        })}
      </div>

      {/* FOOTER INPUT */}
      <div className="p-2 border-t dark:border-gray-600 bg-white dark:bg-gray-800 flex gap-2">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyPress={(event) => event.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatBox;