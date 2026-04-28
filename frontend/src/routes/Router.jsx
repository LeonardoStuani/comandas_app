import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RestrictedRoute from "../components/common/RestrictedRoute";

const LoginForm = lazy(() => import("../components/forms/LoginForm"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const FuncionarioList = lazy(() => import("../pages/FuncionarioList"));
const FuncionarioForm = lazy(() => import("../pages/FuncionarioForm"));
const ClienteList = lazy(() => import("../pages/ClienteList"));
const ClienteForm = lazy(() => import("../pages/ClienteForm"));
const ProdutoList = lazy(() => import("../pages/ProdutoList"));
const ProdutoForm = lazy(() => import("../pages/ProdutoForm"));
const ComandaList = lazy(() => import("../pages/ComandaList"));
const CaixaPage = lazy(() => import("../pages/CaixaPage"));
const PerfilPage = lazy(() => import("../pages/PerfilPage"));
const NotFound = lazy(() => import("../pages/NotFound"));

const Loading = () => (
  <Box
    sx={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress color="secondary" />
  </Box>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <RestrictedRoute>
              <LoginForm />
            </RestrictedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/funcionarios"
          element={
            <ProtectedRoute>
              <FuncionarioList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/funcionario"
          element={
            <ProtectedRoute>
              <FuncionarioForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/funcionario/:id"
          element={
            <ProtectedRoute>
              <FuncionarioForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <ClienteList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente"
          element={
            <ProtectedRoute>
              <ClienteForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/:id"
          element={
            <ProtectedRoute>
              <ClienteForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/produtos"
          element={
            <ProtectedRoute>
              <ProdutoList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/produto"
          element={
            <ProtectedRoute>
              <ProdutoForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/produto/:id"
          element={
            <ProtectedRoute>
              <ProdutoForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comandas"
          element={
            <ProtectedRoute>
              <ComandaList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caixa"
          element={
            <ProtectedRoute>
              <CaixaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <PerfilPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
