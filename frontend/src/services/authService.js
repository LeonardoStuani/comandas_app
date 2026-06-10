import api, { setTokens, clearTokens } from "./api";

// POST /auth/login  -> { access_token, refresh_token, ... }
export const login = async (cpf, senha) => {
  const { data } = await api.post("/auth/login", { cpf, senha });
  setTokens(data);
  return data;
};

// GET /auth/me -> dados do funcionário autenticado
export const me = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

// POST /auth/logout (revoga/auditoria) + limpa tokens locais
export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignora erro de logout (token expirado etc.) — limpamos localmente de qualquer forma
  }
  clearTokens();
};

// POST /auth/refresh
export const refresh = async (refreshToken) => {
  const { data } = await api.post("/auth/refresh", { refresh_token: refreshToken });
  setTokens(data);
  return data;
};
