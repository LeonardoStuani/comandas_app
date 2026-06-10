import api from "./api";

// GET /cliente/
export const listClientes = async () => {
  const { data } = await api.get("/cliente/");
  return data;
};

// GET /cliente/{id}
export const getCliente = async (id) => {
  const { data } = await api.get(`/cliente/${id}`);
  return data;
};

// POST /cliente/ (requer grupo 1 ou 3)
export const createCliente = async (payload) => {
  const { data } = await api.post("/cliente/", payload);
  return data;
};

// PUT /cliente/{id} (requer grupo 1 ou 3)
export const updateCliente = async (id, payload) => {
  const { data } = await api.put(`/cliente/${id}`, payload);
  return data;
};

// DELETE /cliente/{id} (requer grupo 1)
export const deleteCliente = async (id) => {
  await api.delete(`/cliente/${id}`);
};
