import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from 'react-hot-toast'; // ✅ NEW IMPORT

// --- ANIMATION LIBRARY IMPORT ---
import AOS from "aos";
import "aos/dist/aos.css";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ProfilePage from "./pages/profile/ProfilePage";
import TicketPage from "./pages/tickets/TicketPage";
import ScanTicket from "./pages/tickets/ScanTicket";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PaymentSuccess from "./pages/tickets/PaymentSuccess";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/NotFound";

// ✅ NEW: SCROLL COMPONENT IMPORT
import ScrollToTop from "./components/ScrollToTop"; 

function App() {
  const isAuth = Boolean(localStorage.getItem("token"));

  /* ---------------- DARK MODE STATE ---------------- */
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // --- INITIALIZE SCROLL ANIMATIONS ---
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  /* --------------------------------------------------- */

  return (
    <BrowserRouter>
      {/* Step 2: Add Toaster at the top level */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <ScrollToTop /> 

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PASSWORD ROUTES */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            isAuth ? (
              <Dashboard toggleTheme={toggleTheme} theme={theme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Profile */}
        <Route
          path="/profile/:userId"
          element={
            isAuth ? (
              <ProfilePage toggleTheme={toggleTheme} theme={theme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Ticket Page */}
        <Route
          path="/ticket/:eventId"
          element={isAuth ? <TicketPage /> : <Navigate to="/login" />}
        />

        {/* Scanner Page */}
        <Route
          path="/scan"
          element={isAuth ? <ScanTicket /> : <Navigate to="/login" />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={isAuth ? <AdminDashboard /> : <Navigate to="/login" />}
        />

        {/* PAYMENT SUCCESS PAGE */}
        <Route 
          path="/payment/success" 
          element={isAuth ? <PaymentSuccess /> : <Navigate to="/login" />} 
        />

        {/* CATCH-ALL ROUTE */}
        <Route path="*" element={<NotFound />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;