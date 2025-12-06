import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");
  const token = localStorage.getItem("token");

  const hasCalledAPI = useRef(false); // Prevent double API calls

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && hasCalledAPI.current) return;

    const finalizeJoin = async () => {
      hasCalledAPI.current = true;

      try {
        await axios.patch(
          `http://localhost:5000/events/${eventId}/join`,
          { userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTimeout(() => navigate(`/ticket/${eventId}`), 2000);
      } catch (err) {
        console.error("Payment Success Error", err);

        setTimeout(() => navigate(`/dashboard`), 3000);
      }
    };

    if (eventId && userId && token) {
      finalizeJoin();
    }

    return () => {
      if (process.env.NODE_ENV === "development") {
        hasCalledAPI.current = false;
      }
    };
  }, [eventId, userId, navigate, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-xl border border-gray-200 text-center max-w-md w-full">

        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-md">
            <span className="text-4xl">🎉</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-3">
          Your payment has been confirmed.
        </p>

        <p className="text-gray-700 font-medium">
          We’re generating your ticket...
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Redirecting you shortly.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
