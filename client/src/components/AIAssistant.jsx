import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Bot, User, Minus } from "lucide-react";
import axios from "axios";
import { getImageUrl } from "../utils/imageHelper"; 

const AIAssistant = ({ token, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Initial State
  const [messages, setMessages] = useState([
      { role: "assistant", content: `Hi ${user.firstName}! I'm PulseBot. Ask me anything! 🤖` }
  ]);

  const scrollRef = useRef();

  // --- 🔥 FIX: AUTO RESET WHEN USER CHANGES 🔥 ---
  // This ensures if you switch from Farhan to Kamran, the chat wipes immediately.
  useEffect(() => {
      setMessages([
          { role: "assistant", content: `Hi ${user.firstName}! I'm PulseBot. Ask me anything! 🤖` }
      ]);
  }, [user._id]); // Run this whenever User ID changes
  // --------------------------------------------------

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.slice(-6); 
      const res = await axios.post("http://localhost:5000/ai/chat", 
        { message: userMsg.content, history },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botMsg = { role: "assistant", content: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection lost. Try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING BUTTON */}
      <AnimatePresence>
        {!isOpen && (
            <motion.button
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setIsOpen(true); setIsMinimized(false); }}
                className="fixed bottom-8 left-8 z-[2000] p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/40 flex items-center justify-center border-4 border-white dark:border-slate-800"
            >
                <Sparkles className="w-6 h-6 animate-pulse" />
            </motion.button>
        )}
      </AnimatePresence>

      {/* 2. DRAGGABLE CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag 
            dragMomentum={false} 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed z-[2000] w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700 flex flex-col overflow-hidden ${isMinimized ? "h-auto bottom-24 left-8" : "h-[500px] bottom-24 left-8"}`}
          >
            {/* Header (Drag Handle) */}
            <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-between cursor-move">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">PulseBot AI</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-white/80 font-medium">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="text-white/80 hover:text-white transition">
                        <Minus className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area (Hidden if Minimized) */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50" ref={scrollRef}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                {/* Avatar Logic */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${msg.role === "user" ? "bg-slate-200" : "bg-cyan-100"}`}>
                                    {msg.role === "user" ? (
                                        user.picturePath ? (
                                            <img src={getImageUrl(user.picturePath)} className="w-full h-full object-cover" alt="me" />
                                        ) : <User className="w-4 h-4 text-slate-600"/>
                                    ) : (
                                        <Bot className="w-4 h-4 text-cyan-600"/>
                                    )}
                                </div>
                                
                                <div className={`p-3 rounded-2xl text-sm max-w-[80%] leading-relaxed shadow-sm ${
                                    msg.role === "user" 
                                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-none border border-slate-200 dark:border-slate-700" 
                                    : "bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tl-none"
                                }`}>
                                    <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center"><Bot className="w-4 h-4 text-cyan-600"/></div>
                                <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none w-14 flex items-center justify-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none dark:text-white transition"
                        />
                        <button 
                            disabled={isLoading}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-xl transition shadow-lg disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;