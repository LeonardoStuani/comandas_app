// Mapeamento dos grupos (cargos) usados pelo backend.
// O backend trabalha com inteiros; aqui ligamos número <-> rótulo.
// require_group([1]) = só Administrador | require_group([1, 3]) = Admin e Garçom
export const GRUPOS = [
  { value: 1, label: "Administrador" },
  { value: 2, label: "Caixa" },
  { value: 3, label: "Garçom" },
];

export const grupoLabel = (valor) =>
  GRUPOS.find((g) => g.value === Number(valor))?.label ?? `Grupo ${valor}`;

// Verifica se o usuário pertence a algum dos grupos permitidos (por número).
// Os números seguem as permissões do backend, independente do rótulo exibido.
export const ehDoGrupo = (usuario, gruposPermitidos = []) =>
  !!usuario && gruposPermitidos.includes(Number(usuario.grupo));

// Regras de acesso por recurso (números de grupo conforme o backend)
export const PERMISSOES = {
  funcionarioGerenciar: [1],      // listar/novo/editar/excluir funcionário
  clienteCriarEditar: [1, 3],     // novo/editar cliente
  clienteExcluir: [1],            // excluir cliente
  produtoGerenciar: [1],          // novo/editar/excluir produto
  comandaAdmin: [1],              // editar/excluir/cancelar comanda e remover item / fechar
  caixaAcessar: [1, 3],           // módulo caixa/recebimento
};

// Status da comanda no backend: 0 = aberta, 1 = fechada, 2 = cancelada
export const COMANDA_STATUS = {
  ABERTA: 0,
  FECHADA: 1,
  CANCELADA: 2,
};

export const comandaStatusLabel = (status) =>
  ({ 0: "aberta", 1: "fechada", 2: "cancelada" }[Number(status)] ?? "—");

// Iniciais a partir de um nome completo (para avatares)
export const iniciais = (nome = "") => {
  const partes = String(nome).trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "US";
  const primeira = partes[0][0] ?? "U";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : (partes[0][1] ?? "S");
  return `${primeira}${ultima}`.toUpperCase();
};
