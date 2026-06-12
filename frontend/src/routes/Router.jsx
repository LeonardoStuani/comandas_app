//Leonardo Stuani Godoi
import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RestrictedRoute from "../components/common/RestrictedRoute";

const LoginForm        = lazy(() => import("../components/forms/LoginForm"));
const Dashboard        = lazy(() => import("../pages/Dashboard"));
const FuncionarioList  = lazy(() => import("../pages/FuncionarioList"));
const FuncionarioForm  = lazy(() => import("../pages/FuncionarioForm"));
const ClienteList      = lazy(() => import("../pages/ClienteList"));
const ClienteForm      = lazy(() => import("../pages/ClienteForm"));
const ProdutoList      = lazy(() => import("../pages/ProdutoList"));
const ProdutoForm      = lazy(() => import("../pages/ProdutoForm"));
const ComandaList      = lazy(() => import("../pages/ComandaList"));
const ComandaAberta    = lazy(() => import("../pages/ComandaAberta"));
const CaixaPage        = lazy(() => import("../pages/CaixaPage"));
const PerfilPage       = lazy(() => import("../pages/PerfilPage"));
const NotFound         = lazy(() => import("../pages/NotFound"));

const Loading = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
    <div style={{ width: 32, height: 32, border: "2px solid var(--line)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<RestrictedRoute><LoginForm /></RestrictedRoute>} />

      <Route path="/home"        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/caixa"       element={<ProtectedRoute allowedGroups={[1, 3]}><CaixaPage /></ProtectedRoute>} />

      <Route path="/comandas"    element={<ProtectedRoute><ComandaList /></ProtectedRoute>} />
      <Route path="/comanda/:id" element={<ProtectedRoute><ComandaAberta /></ProtectedRoute>} />

      <Route path="/produtos"    element={<ProtectedRoute><ProdutoList /></ProtectedRoute>} />
      <Route path="/produto"     element={<ProtectedRoute><ProdutoForm /></ProtectedRoute>} />
      <Route path="/produto/:id" element={<ProtectedRoute><ProdutoForm /></ProtectedRoute>} />

      <Route path="/clientes"    element={<ProtectedRoute><ClienteList /></ProtectedRoute>} />
      <Route path="/cliente"     element={<ProtectedRoute><ClienteForm /></ProtectedRoute>} />
      <Route path="/cliente/:id" element={<ProtectedRoute><ClienteForm /></ProtectedRoute>} />

      <Route path="/funcionarios"    element={<ProtectedRoute allowedGroups={[1]}><FuncionarioList /></ProtectedRoute>} />
      <Route path="/funcionario"     element={<ProtectedRoute allowedGroups={[1]}><FuncionarioForm /></ProtectedRoute>} />
      <Route path="/funcionario/:id" element={<ProtectedRoute allowedGroups={[1]}><FuncionarioForm /></ProtectedRoute>} />

      <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;