//Leonardo Stuani Godoi
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ehDoGrupo } from "../../utils/grupos";

const FullLoader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
    <div style={{ width: 32, height: 32, border: "2px solid var(--line)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// allowedGroups (opcional): lista de números de grupo com acesso à rota.
// - Não autenticado  -> /login
// - Fora do grupo    -> /home
// - OK               -> renderiza
const ProtectedRoute = ({ children, allowedGroups }) => {
  const { isAuthenticated, usuario, loading } = useAuth();
  if (loading) return <FullLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedGroups && !ehDoGrupo(usuario, allowedGroups)) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default ProtectedRoute;