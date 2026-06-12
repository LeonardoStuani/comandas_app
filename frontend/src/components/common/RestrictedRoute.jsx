//Leonardo Stuani Godoi
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RestrictedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
};

export default RestrictedRoute;