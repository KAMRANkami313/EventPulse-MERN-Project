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

// --- SEO IMPORT ---
import SEO from "./components/SEO";
import { organizationSchema, webSiteSchema } from "./components/JsonLd";

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

// --- COMBINED GLOBAL SCHEMAS (Organization + WebSite) ---
const globalJsonLd = [organizationSchema, webSiteSchema];

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

      {/* Global SEO — Organization + WebSite structured data on every page */}
      <SEO jsonLd={globalJsonLd} />

      {token && user && (
          <AIAssistant key={user._id} token={token} user={user} />
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ── PUBLIC ROUTES (SEO-optimized for Google indexing) ── */}
        <Route
          path="/login"
          element={
            <>
              <SEO
                title="Login"
                description="Sign in to your EventPulse account to discover events, connect with communities, and manage your event tickets."
                keywords="login, sign in, event login, EventPulse login, access events"
                jsonLd={globalJsonLd}
              />
              <Login />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <SEO
                title="Create Account"
                description="Join EventPulse for free — discover amazing events, create your own, and connect with communities near you."
                keywords="register, sign up, create account, join events, free event platform"
                jsonLd={globalJsonLd}
              />
              <Register />
            </>
          }
        />

        {/* PASSWORD ROUTES */}
        <Route
          path="/forgot-password"
          element={
            <>
              <SEO
                title="Forgot Password"
                description="Reset your EventPulse password. Enter your email and we'll send you a link to create a new password."
                keywords="forgot password, reset password, password recovery, EventPulse"
                jsonLd={globalJsonLd}
              />
              <ForgotPassword />
            </>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <>
              <SEO
                title="Reset Password"
                description="Set a new password for your EventPulse account."
                noindex={true}
              />
              <ResetPassword />
            </>
          }
        />

        {/* ── PROTECTED ROUTES (noindex — behind auth wall) ── */}
        <Route
          path="/dashboard"
          element={
            <>
              <SEO
                title="Dashboard"
                description="Browse and discover events near you on your EventPulse dashboard."
                noindex={true}
              />
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <>
              <SEO
                title="Profile"
                description="View your EventPulse profile, events, and community activity."
                noindex={true}
              />
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <SEO title="Settings" description="Manage your EventPulse account settings." noindex={true} />
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ticket/:eventId"
          element={
            <>
              <SEO title="Your Ticket" description="View your EventPulse event ticket and QR code." noindex={true} />
              <ProtectedRoute>
                <TicketPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/scan"
          element={
            <>
              <SEO title="Scan Ticket" description="Scan an EventPulse event ticket QR code." noindex={true} />
              <ProtectedRoute>
                <ScanTicket />
              </ProtectedRoute>
            </>
          }
        />

        {/* ADMIN ROUTE */}
        <Route
          path="/admin"
          element={
            <>
              <SEO title="Admin Panel" noindex={true} />
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </>
          }
        />

        {/* PAYMENT SUCCESS PAGE */}
        <Route
          path="/payment/success"
          element={
            <>
              <SEO title="Payment Successful" noindex={true} />
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            </>
          }
        />

        {/* CATCH-ALL ROUTE */}
        <Route
          path="*"
          element={
            <>
              <SEO
                title="Page Not Found"
                description="The page you're looking for doesn't exist on EventPulse."
                noindex={true}
              />
              <NotFound />
            </>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;