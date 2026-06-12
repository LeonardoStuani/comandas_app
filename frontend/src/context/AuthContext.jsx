//Leonardo Stuani Godoi
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import showSnackbar from "../utils/snackbar";
import { grupoLabel, iniciais } from "../utils/grupos";
import * as authService from "../services/authService";
import { getAccessToken, clearTokens, apiErrorMessage } from "../services/api";

const AuthContext = createContext(null);

// Adiciona campos derivados (rótulo do grupo) ao usuário vindo de /auth/me
const decorate = (u) => (u ? { ...u, grupoLabel: grupoLabel(u.grupo) } : null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAccessToken());
  const [loading, setLoading] = useState(() => !!getAccessToken());

  // Restaura a sessão ao carregar a app: se há token, valida buscando /auth/me
  useEffect(() => {
    let active = true;
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((u) => {
        if (!active) return;
        setUsuario(decorate(u));
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (!active) return;
        clearTokens();
        setIsAuthenticated(false);
        setUsuario(null);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (cpf, senha) => {
      try {
        await authService.login(cpf, senha);
        const u = await authService.me();
        setUsuario(decorate(u));
        setIsAuthenticated(true);
        showSnackbar("Login realizado com sucesso.", "success");
        navigate("/home", { replace: true });
        return true;
      } catch (error) {
        showSnackbar(apiErrorMessage(error, "CPF ou senha inválidos."), "error");
        return false;
      }
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUsuario(null);
    showSnackbar("Sessão encerrada com sucesso.", "info");
    navigate("/login", { replace: true });
  }, [navigate]);

  const getIniciais = () => iniciais(usuario?.nome);

  const value = { isAuthenticated, usuario, loading, login, logout, getIniciais };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);