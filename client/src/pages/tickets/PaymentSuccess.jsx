import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");
  const token = localStorage.getItem("token");

  const hasCalledAPI = useRef(false); // Prevent double API calls

  useEffect(() => {
    // 🛡️ Safety check: Ensure API is only called once even in Strict Mode
    if (hasCalledAPI.current) return;

    const finalizeJoin = async () => {
      hasCalledAPI.current = true;

      try {
        // 🟢 DEPLOYMENT CHANGE: Using VITE_API_URL variable
        await axios.patch(
          `${API_URL}/events/${eventId}/join`,
          { userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Redirect to ticket after a short animation delay
        setTimeout(() => navigate(`/ticket/${eventId}`), 2500);
      } catch (err) {
        console.error("Payment Success Error", err);
        // Fallback redirect if error occurs
        setTimeout(() => navigate(`/dashboard`), 3000);
      }
    };

    if (eventId && userId && token) {
      finalizeJoin();
    }
  }, [eventId, userId, navigate, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 text-center max-w-md w-full relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-green-500"></div>

        <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center shadow-inner ring-4 ring-emerald-50 dark:ring-emerald-900/10">
            <CheckCircle className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Payment Successful!
        </h1>

        <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">
          Your spot has been confirmed.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wide">
              Generating your unique ticket...
            </p>
        </div>

      </motion.div>
    </div>
  );
};

export default PaymentSuccess;