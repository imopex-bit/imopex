import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // 🔐 Validación más segura
  if (!token || token === "undefined" || token === "null") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;