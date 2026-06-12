//Leonardo Stuani Godoi
import api from "./api";

// ── Módulo Caixa / Recebimento ──────────────────────────────────────────────
// Endpoints expostos pela API (grupo 1 e 3):
//   GET  /recebimento/dashboard                       -> comandas abertas (com fotos)
//   GET  /recebimento/comandas/detalhe/{comandas_ids} -> detalhe p/ conferência
//   POST /recebimento/completo                        -> efetua o recebimento
//   GET  /recebimento/comprovante/{recebimento_id}    -> comprovante detalhado

// Dashboard com todas as comandas abertas (RecebimentoDashboardItem[]).
export const getRecebimentoDashboard = async () => {
  const { data } = await api.get("/recebimento/dashboard");
  return data;
};

// Detalhe das comandas selecionadas (produtos, quantidades, fotos e total).
// `ids` é um array de números; a API recebe os ids separados por vírgula.
export const detalharComandas = async (ids = []) => {
  const lista = Array.isArray(ids) ? ids.join(",") : ids;
  const { data } = await api.get(`/recebimento/comandas/detalhe/${lista}`);
  return data;
};

// Efetua o recebimento completo (fecha as comandas, registra funcionário,
// data/hora, descontos/acréscimos e o valor final). RecebimentoCompletoResponse.
export const receberComandas = async ({
  comandas_ids,
  funcionario_id,
  cliente_id = null,
  desconto_valor = null,
  acrescimo_valor = null,
}) => {
  const { data } = await api.post("/recebimento/completo", {
    comandas_ids,
    funcionario_id,
    cliente_id,
    desconto_valor,
    acrescimo_valor,
  });
  return data;
};

// Comprovante detalhado de um recebimento já efetuado (ComprovanteRecebimento).
export const getComprovante = async (recebimentoId) => {
  const { data } = await api.get(`/recebimento/comprovante/${recebimentoId}`);
  return data;
};