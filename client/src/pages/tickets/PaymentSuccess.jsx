import { useEffect, useRef } from "react"; // Import useRef
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");
  const token = localStorage.getItem("token");
  
  // FIX: Use a ref to track if we already called the API
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    
    // Safety check for development mode to ensure API call happens exactly once per component lifecycle
    if (process.env.NODE_ENV === 'development' && hasCalledAPI.current) {
        return; 
    }
    
    const finalizeJoin = async () => {
      
      // Mark as called immediately inside the function
      hasCalledAPI.current = true; 

      try {
        // Trigger the Join Logic (which sends email + notification + saves transaction)
        await axios.patch(`http://localhost:5000/events/${eventId}/join`, 
            { userId }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Redirect to Ticket after showing success message
        setTimeout(() => navigate(`/ticket/${eventId}`), 2000);
      } catch (err) {
        console.error("Payment Success Error", err);
        // Handle error, maybe redirect to dashboard with an error message
        setTimeout(() => navigate(`/dashboard`), 3000);
      }
    };

    if (eventId && userId && token) {
        finalizeJoin();
    }
    
    // Cleanup function for Strict Mode during development
    return () => {
        if (process.env.NODE_ENV === 'development') {
            hasCalledAPI.current = false;
        }
    };

  }, [eventId, userId, navigate, token]); // Dependencies

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-10 bg-white shadow-xl rounded-xl">
            <h1 className="text-4xl mb-4 text-green-600 font-bold">🎉 Payment Successful!</h1>
            <p className="text-gray-700">Generating your ticket...</p>
            <div className="mt-4 text-sm text-gray-500">
                Redirecting to your ticket page shortly.
            </div>
        </div>
    </div>
  );
};

export default PaymentSuccess;