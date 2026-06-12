//Leonardo Stuani Godoi
import api from "./api";

// GET /comanda/ com filtros opcionais (status, skip, limit, cliente_id, funcionario_id)
export const listComandas = async (params = {}) => {
  const { data } = await api.get("/comanda/", { params });
  return data;
};

// GET /comanda/{id}
export const getComanda = async (id) => {
  const { data } = await api.get(`/comanda/${id}`);
  return data;
};

// POST /comanda/ -> { comanda, status: 0, funcionario_id, cliente_id? }
export const createComanda = async (payload) => {
  const { data } = await api.post("/comanda/", payload);
  return data;
};

// PUT /comanda/{id} (requer grupo 1) — usado p/ fechar (status:1), trocar cliente etc.
export const updateComanda = async (id, payload) => {
  const { data } = await api.put(`/comanda/${id}`, payload);
  return data;
};

// PUT /comanda/{id}/cancelar (requer grupo 1)
export const cancelComanda = async (id) => {
  const { data } = await api.put(`/comanda/${id}/cancelar`);
  return data;
};

// DELETE /comanda/{id} (requer grupo 1) — só sem produtos vinculados
export const deleteComanda = async (id) => {
  await api.delete(`/comanda/${id}`);
};

// ── Produtos da comanda ─────────────────────────────────────────────────────

// GET /comanda/{id}/produtos
export const listComandaProdutos = async (comandaId) => {
  const { data } = await api.get(`/comanda/${comandaId}/produtos`);
  return data;
};

// POST /comanda/{comandaId}/produto -> { produto_id, funcionario_id, quantidade, valor_unitario }
export const addComandaProduto = async (comandaId, payload) => {
  const { data } = await api.post(`/comanda/${comandaId}/produto`, payload);
  return data;
};

// PUT /comanda/produto/{id} (requer grupo 1) -> { quantidade?, valor_unitario? }
export const updateComandaProduto = async (itemId, payload) => {
  const { data } = await api.put(`/comanda/produto/${itemId}`, payload);
  return data;
};

// DELETE /comanda/produto/{id} (requer grupo 1)
export const removeComandaProduto = async (itemId) => {
  await api.delete(`/comanda/produto/${itemId}`);
};