import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";

// --- ANIMATION LIBRARY IMPORT ---
import AOS from "aos";
import "aos/dist/aos.css";

// --- BOT IMPORT ---
import AIAssistant from "./components/AIAssistant";

// --- LAYOUT COMPONENTS ---
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminRoute from "./components/layout/AdminRoute";

// --- PAGE IMPORTS ---
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
  const { theme } = useTheme();

  // --- INITIALIZE SCROLL ANIMATIONS ---
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
  }, []);

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

        {/* PROTECTED ROUTES — use ProtectedRoute instead of manual isAuthenticated check */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket/:eventId"
          element={
            <ProtectedRoute>
              <TicketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan"
          element={
            <ProtectedRoute>
              <ScanTicket />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTE — uses AdminRoute which checks both auth AND admin role */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* PAYMENT SUCCESS PAGE */}
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />

        {/* CATCH-ALL ROUTE */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;