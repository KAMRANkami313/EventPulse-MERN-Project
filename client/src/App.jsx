import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import { useAuth } from "./context/AuthContext";

// --- ANIMATION LIBRARY IMPORT ---
import AOS from "aos";
import "aos/dist/aos.css";

// --- BOT IMPORT ---
import AIAssistant from "./components/AIAssistant";

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
import SettingsPage from "./pages/settings/SettingsPage";

import ScrollToTop from "./components/ScrollToTop";

function App() {
  const { user, token, isAuthenticated } = useAuth();

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
      {/* Global Notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Scroll Reset on Navigation */}
      <ScrollToTop />

      {/*
          🤖 AI BOT:
          Added `key={user?._id}`. This forces React to destroy and recreate
          the bot component whenever the user ID changes (e.g. logout/login).
          This wipes the chat history and resets the greeting to the new user.
      */}
      {token && user && (
          <AIAssistant key={user._id} token={token} user={user} />
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PASSWORD ROUTES */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
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
            isAuthenticated ? (
              <ProfilePage toggleTheme={toggleTheme} theme={theme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Settings Page */}
        <Route
          path="/settings"
          element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />}
        />

        {/* Ticket Page */}
        <Route
          path="/ticket/:eventId"
          element={isAuthenticated ? <TicketPage /> : <Navigate to="/login" />}
        />

        {/* Scanner Page */}
        <Route
          path="/scan"
          element={isAuthenticated ? <ScanTicket /> : <Navigate to="/login" />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />}
        />

        {/* PAYMENT SUCCESS PAGE */}
        <Route
          path="/payment/success"
          element={isAuthenticated ? <PaymentSuccess /> : <Navigate to="/login" />}
        />

        {/* CATCH-ALL ROUTE */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;