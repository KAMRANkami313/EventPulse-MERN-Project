import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute — Guards routes that require authentication
 *
 * USAGE in App.jsx:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 *
 * BENEFITS:
 * - Eliminates repetitive `isAuthenticated ? <Component /> : <Navigate to="/login" />` in every route
 * - Single place to add loading spinners, subscription checks, etc.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;