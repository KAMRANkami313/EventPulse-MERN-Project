import { useState } from "react";
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

        const response = await axios.post(
          "http://localhost:5000/events/verify",
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-4 left-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded shadow-sm text-sm transition"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-gray-800">Ticket Scanner</h1>

      <div className="w-full max-w-sm border rounded-xl overflow-hidden shadow-lg bg-white">
        {/* CAMERA VIEW */}
        {status === "idle" && (
          <Scanner
            onScan={handleScan}
            onError={(error) => console.log(error)}
            components={{ audio: false }}
          />
        )}

        {/* PROCESSING */}
        {status === "processing" && (
          <div className="h-80 flex items-center justify-center bg-yellow-100 text-yellow-800">
            <p className="animate-pulse font-semibold">Verifying...</p>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <div className="h-80 bg-green-100 flex flex-col items-center justify-center text-center p-6 rounded-b-xl">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-700">ACCESS GRANTED</h2>
            <p className="mt-2 text-gray-700">{scanResult?.attendee}</p>
            <p className="text-sm text-gray-500">{scanResult?.event}</p>
            <button
              onClick={resetScanner}
              className="mt-6 bg-green-700 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-green-800 transition"
            >
              Scan Next
            </button>
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div className="h-80 bg-red-100 flex flex-col items-center justify-center text-center p-6 rounded-b-xl">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-700">ACCESS DENIED</h2>
            <p className="mt-2 text-gray-700">{errorMsg}</p>
            <button
              onClick={resetScanner}
              className="mt-6 bg-red-700 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-red-800 transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-gray-500 text-sm">
        Point the camera at the attendee's QR code
      </p>

    </div>
  );
};

export default ScanTicket;
