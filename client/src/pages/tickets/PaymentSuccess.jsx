import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const finalizeJoin = async () => {
      try {
        // Trigger the Join Logic (which sends email + notification)
        await axios.patch(`http://localhost:5000/events/${eventId}/join`, 
            { userId }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Redirect to Ticket
        setTimeout(() => navigate(`/ticket/${eventId}`), 2000);
      } catch (err) {
        console.error("Payment Success Error", err);
      }
    };

    if (eventId && userId) finalizeJoin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
            <h1 className="text-4xl mb-4">🎉 Payment Successful!</h1>
            <p>Generating your ticket...</p>
        </div>
    </div>
  );
};

export default PaymentSuccess;