import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
import PaymentSuccess from "./pages/tickets/PaymentSuccess"; // <--- IMPORT THIS

function App() {
  const isAuth = Boolean(localStorage.getItem("token"));

  /* ---------------- DARK MODE STATE ---------------- */
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // --- INITIALIZE SCROLL ANIMATIONS ---
  useEffect(() => {
    AOS.init({
      duration: 800, // Animation speed (ms)
      once: true,    // Only animate once when scrolling down
      offset: 100,   // Trigger animation 100px before element is visible
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
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard receives theme + toggle */}
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

        {/* PAYMENT SUCCESS PAGE (New) */}
        <Route 
          path="/payment/success" 
          element={isAuth ? <PaymentSuccess /> : <Navigate to="/login" />} 
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;