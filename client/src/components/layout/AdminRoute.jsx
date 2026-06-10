import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * AdminRoute — Guards routes that require admin role
 *
 * USAGE in App.jsx:
 *   <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
 *
 * BENEFITS:
 * - Previously, AdminDashboard only checked isAuthenticated (not isAdmin)
 * - Non-admin users could visit /admin and see a redirect flash
 * - Now they get immediately redirected to /dashboard
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;