import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

/**
 * PaymentSuccess Page
 *
 * SECURITY FIX: Instead of blindly calling joinEvent (which anyone could do
 * by visiting the URL), we now call /payment/verify?session_id=xxx which:
 * 1. Verifies the Stripe session is real and paid
 * 2. Checks the session belongs to the logged-in user
 * 3. Joins the event if the webhook hasn't processed yet
 *
 * The session_id comes from Stripe's redirect (tamper-proof, set server-side).
 */
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [error, setError] = useState(null);

  const hasCalledAPI = useRef(false);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (hasCalledAPI.current) return;

    const verifyAndJoin = async () => {
      hasCalledAPI.current = true;

      // If no session_id, the user may have navigated here manually
      if (!sessionId) {
        setError("Missing payment session. If you completed payment, please check your email for confirmation.");
        setTimeout(() => navigate("/dashboard"), 4000);
        return;
      }

      try {
        // Call server-side verification — this checks with Stripe that the
        // session is real, paid, and belongs to this user
        const response = await api.get(`/payment/verify?session_id=${sessionId}`);

        if (response.data.verified) {
          const eventId = response.data.eventId;
          // Redirect to ticket page after success animation
          setTimeout(() => navigate(`/ticket/${eventId}`), 2500);
        } else {
          setError("Payment verification failed. Please contact support.");
          setTimeout(() => navigate("/dashboard"), 4000);
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        const msg = err.response?.data?.error || "Payment verification failed. If payment was completed, your ticket will appear shortly.";
        setError(msg);
        setTimeout(() => navigate("/dashboard"), 5000);
      }
    };

    if (token) {
      verifyAndJoin();
    } else {
      setError("Please log in to complete payment verification.");
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [sessionId, navigate, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 text-center max-w-md w-full relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className={`absolute top-0 left-0 w-full h-2 ${error ? "bg-gradient-to-r from-red-400 to-rose-500" : "bg-gradient-to-r from-emerald-400 to-green-500"}`}></div>

        {error ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shadow-inner ring-4 ring-red-50 dark:ring-red-900/10">
                <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
              </div>
            </motion.div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              Verification Issue
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
              {error}
            </p>
            <p className="text-slate-400 text-xs">Redirecting you back...</p>
          </>
        ) : (
          <>
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
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;