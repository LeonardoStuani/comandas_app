import axios from "axios";

// Instância central do axios. A baseURL aponta para /api (proxy do Vite),
// que encaminha para a API HTTPS sem problemas de CORS/certificado.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Tokens ────────────────────────────────────────────────────────────────
export const TOKEN_KEY = "comandas.access_token";
export const REFRESH_KEY = "comandas.refresh_token";

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = ({ access_token, refresh_token } = {}) => {
  if (access_token) localStorage.setItem(TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

// Extrai uma mensagem amigável do erro do axios/FastAPI
export const apiErrorMessage = (error, fallback = "Ocorreu um erro inesperado.") => {
  const detail = error?.response?.data?.detail;

  // Erros de integridade do banco (FK ON DELETE RESTRICT) vêm como texto cru do SQL.
  // Traduz para algo legível em vez de mostrar a query inteira na tela.
  if (typeof detail === "string") {
    const low = detail.toLowerCase();
    if (low.includes("integrityerror") || low.includes("foreign key constraint")) {
      if (low.includes("comanda")) {
        return "Este produto não pode ser excluído porque já foi usado em comandas.";
      }
      return "Este registro não pode ser excluído porque está vinculado a outros dados.";
    }
    return detail;
  }

  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return error?.message || fallback;
};

// ── Interceptor de requisição: injeta o Bearer token ────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Interceptor de resposta: renova o access token em 401 (uma vez) ─────────
let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes("/auth/");

    if (status === 401 && !original?._retry && getRefreshToken() && !isAuthCall) {
      if (isRefreshing) {
        // Aguarda a renovação em andamento e refaz a requisição
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: getRefreshToken() },
        );
        setTokens(data);
        flushQueue(null, data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        clearTokens();
        // Sessão expirada: volta ao login
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
