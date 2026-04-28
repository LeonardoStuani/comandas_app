import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RestrictedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
};

export default RestrictedRoute;
