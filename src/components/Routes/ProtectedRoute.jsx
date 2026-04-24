// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ allowedRoles }) => {
  const rawRole = Cookies.get("role")?.trim().toLowerCase();
  const role = rawRole === "super-admin" ? "superadmin" : rawRole; // normalize hyphen

  if (!role) return <Navigate to="/login" replace />;

  const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
  if (!normalizedAllowed.includes(role)) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;