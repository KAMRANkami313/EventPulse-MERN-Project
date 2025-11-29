import { useState } from "react";
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ScanTicket = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, scanning, success, error
  const [errorMsg, setErrorMsg] = useState("");

  const handleScan = async (result) => {
    if (result && result.length > 0) {
      // Pause scanning logic to prevent multiple requests
      if (status === "success" || status === "error") return;

      try {
        const rawData = result[0].rawValue;
        const ticketData = JSON.parse(rawData); // Parse the QR JSON

        setStatus("processing");

        // Send to Backend
        const response = await axios.post(
          "http://localhost:5000/events/verify", 
          { 
            eventId: ticketData.eventId, 
            userId: ticketData.userId 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.valid) {
          setScanResult(response.data);
          setStatus("success");
        }

      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMsg(err.response?.data?.message || "Invalid Ticket Format");
      }
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      
      <button onClick={() => navigate("/dashboard")} className="absolute top-4 left-4 bg-gray-800 px-4 py-2 rounded text-sm">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Ticket Scanner</h1>

      <div className="w-full max-w-sm border-4 border-gray-700 rounded-xl overflow-hidden relative">
        {/* CAMERA VIEW */}
        {status === "idle" && (
            <Scanner 
                onScan={handleScan} 
                onError={(error) => console.log(error)}
                components={{ audio: false }}
            />
        )}

        {/* PROCESSING OVERLAY */}
        {status === "processing" && (
            <div className="h-80 bg-gray-900 flex items-center justify-center">
                <p className="animate-pulse">Verifying...</p>
            </div>
        )}

        {/* SUCCESS OVERLAY */}
        {status === "success" && (
            <div className="h-80 bg-green-600 flex flex-col items-center justify-center text-center p-6">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold">ACCESS GRANTED</h2>
                <p className="mt-2 text-lg">{scanResult?.attendee}</p>
                <p className="text-sm opacity-80">{scanResult?.event}</p>
                <button onClick={resetScanner} className="mt-6 bg-white text-green-700 px-6 py-2 rounded-full font-bold shadow-lg">
                    Scan Next
                </button>
            </div>
        )}

        {/* ERROR OVERLAY */}
        {status === "error" && (
            <div className="h-80 bg-red-600 flex flex-col items-center justify-center text-center p-6">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold">ACCESS DENIED</h2>
                <p className="mt-2">{errorMsg}</p>
                <button onClick={resetScanner} className="mt-6 bg-white text-red-700 px-6 py-2 rounded-full font-bold shadow-lg">
                    Try Again
                </button>
            </div>
        )}
      </div>

      <p className="mt-4 text-gray-500 text-sm">
        Point camera at the Attendee's QR Code
      </p>

    </div>
  );
};

export default ScanTicket;