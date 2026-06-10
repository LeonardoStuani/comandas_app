import api from "./api";

// GET /produto/ (protegida) -> [{ id_produto, nome, descricao, valor_unitario }]
export const listProdutos = async () => {
  const { data } = await api.get("/produto/");
  return data;
};

// GET /produto/{id_produto}
export const getProduto = async (id) => {
  const { data } = await api.get(`/produto/${id}`);
  return data;
};

// POST /produto/ (requer grupo 1) — foto é obrigatória no backend (bytes)
export const createProduto = async (payload) => {
  const { data } = await api.post("/produto/", payload);
  return data;
};

// PUT /produto/{id_produto} (requer grupo 1)
export const updateProduto = async (id, payload) => {
  const { data } = await api.put(`/produto/${id}`, payload);
  return data;
};

// DELETE /produto/{id_produto} (requer grupo 1)
export const deleteProduto = async (id) => {
  await api.delete(`/produto/${id}`);
};
