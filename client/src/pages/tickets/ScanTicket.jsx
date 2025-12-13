import { useState } from "react";
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ScanLine, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL;

const ScanTicket = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, processing, success, error
  const [errorMsg, setErrorMsg] = useState("");

  const handleScan = async (result) => {
    if (result && result.length > 0) {
      if (status === "success" || status === "error") return;

      try {
        const rawData = result[0].rawValue;
        const ticketData = JSON.parse(rawData);

        setStatus("processing");

        // 🟢 DEPLOYMENT CHANGE: Using VITE_API_URL variable
        const response = await axios.post(
          `${API_URL}/events/verify`,
          { eventId: ticketData.eventId, userId: ticketData.userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.valid) {
          setScanResult(response.data);
          setStatus("success");
        }

      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMsg(err.response?.data?.message || "Invalid Ticket");
      }
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative transition-colors">
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 z-20 bg-white/50 dark:bg-black/30 backdrop-blur-md p-3 rounded-full text-slate-800 dark:text-white hover:bg-white/80 transition shadow-sm"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="w-full max-w-sm relative">
        <h1 className="text-3xl font-black text-center mb-8 text-slate-800 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <ScanLine className="w-8 h-8 text-violet-600" /> Ticket Scanner
        </h1>

        <div className="w-full aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 relative">
            
            {/* IDLE: CAMERA VIEW */}
            {status === "idle" && (
            <div className="relative w-full h-full">
                <Scanner
                    onScan={handleScan}
                    onError={(error) => console.log(error)}
                    components={{ audio: false, torch: false }}
                    styles={{ container: { width: '100%', height: '100%' } }}
                />
                {/* Overlay Graphic */}
                <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-xl relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-violet-500 -mt-1 -ml-1"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-violet-500 -mt-1 -mr-1"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-violet-500 -mb-1 -ml-1"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-violet-500 -mb-1 -mr-1"></div>
                    </div>
                </div>
                <p className="absolute bottom-6 w-full text-center text-white/80 text-sm font-medium z-10">Point at QR Code</p>
            </div>
            )}

            {/* PROCESSING */}
            {status === "processing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-20">
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                <p className="text-white font-bold text-lg animate-pulse">Verifying Ticket...</p>
            </div>
            )}

            {/* SUCCESS */}
            {status === "success" && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-center p-6 z-20"
            >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-white mb-1">ACCESS GRANTED</h2>
                <div className="bg-emerald-600/50 p-4 rounded-xl w-full mt-4 backdrop-blur-sm border border-emerald-400/30">
                    <p className="text-white font-bold text-xl">{scanResult?.attendee}</p>
                    <p className="text-emerald-100 text-sm">{scanResult?.event}</p>
                </div>
                <button
                onClick={resetScanner}
                className="mt-8 bg-white text-emerald-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-50 transition active:scale-95"
                >
                Scan Next
                </button>
            </motion.div>
            )}

            {/* ERROR */}
            {status === "error" && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-rose-500 flex flex-col items-center justify-center text-center p-6 z-20"
            >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <XCircle className="w-10 h-10 text-rose-600" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">ACCESS DENIED</h2>
                <p className="text-rose-100 bg-rose-600/50 px-4 py-2 rounded-lg font-medium">{errorMsg}</p>
                <button
                onClick={resetScanner}
                className="mt-8 bg-white text-rose-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-rose-50 transition active:scale-95"
                >
                Try Again
                </button>
            </motion.div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScanTicket;