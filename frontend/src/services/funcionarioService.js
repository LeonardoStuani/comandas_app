import api from "./api";

// GET /funcionario/ (requer grupo 1)
export const listFuncionarios = async () => {
  const { data } = await api.get("/funcionario/");
  return data;
};

// GET /funcionario/{id}
export const getFuncionario = async (id) => {
  const { data } = await api.get(`/funcionario/${id}`);
  return data;
};

// POST /funcionario/ (requer grupo 1)
export const createFuncionario = async (payload) => {
  const { data } = await api.post("/funcionario/", payload);
  return data;
};

// PUT /funcionario/{id} (requer grupo 1)
export const updateFuncionario = async (id, payload) => {
  const { data } = await api.put(`/funcionario/${id}`, payload);
  return data;
};

// DELETE /funcionario/{id} (requer grupo 1)
export const deleteFuncionario = async (id) => {
  await api.delete(`/funcionario/${id}`);
};
