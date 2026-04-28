/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import showSnackbar from "../utils/snackbar";

const AuthContext = createContext(null);

const FIXED_USER = {
  nome: "Leonardo Stuani",
  login: "abc",
  grupo: "Administrador",
  email: "leo@uniplaclages.edu.br",
  telefone: "49999999999",
  avatar: "/user-face.png",
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("loginRealizado") === "true",
  );
  const [usuario, setUsuario] = useState(() => {
    const savedUser = sessionStorage.getItem("usuario");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (loginValue, senha) => {
    const normalizedLogin = loginValue.trim().toLowerCase();
    const normalizedPassword = senha.trim();

    if (normalizedLogin !== "abc" || normalizedPassword !== "bolinhas") {
      showSnackbar("Usuario ou senha invalidos.", "error");
      return false;
    }

    setIsAuthenticated(true);
    setUsuario(FIXED_USER);
    sessionStorage.setItem("loginRealizado", "true");
    sessionStorage.setItem("usuario", JSON.stringify(FIXED_USER));
    showSnackbar("Login realizado com sucesso.", "success");
    navigate("/home", { replace: true });
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsuario(null);
    sessionStorage.removeItem("loginRealizado");
    sessionStorage.removeItem("usuario");
    showSnackbar("Sessao encerrada com sucesso.", "info");
    navigate("/login", { replace: true });
  };

  const getIniciais = () => {
    if (!usuario?.nome) return "US";
    const partes = usuario.nome.split(" ").filter(Boolean);
    const primeira = partes[0]?.[0] ?? "U";
    const ultima = partes[partes.length - 1]?.[0] ?? "S";
    return `${primeira}${ultima}`.toUpperCase();
  };

  const value = { isAuthenticated, usuario, login, logout, getIniciais };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
