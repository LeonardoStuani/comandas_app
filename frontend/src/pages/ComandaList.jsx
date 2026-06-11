import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button,
} from "@mui/material";
import {
  Plus, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Pencil, Trash2, PlusCircle, XCircle,
} from "lucide-react";
import ConfirmDialog from "../components/common/ConfirmDialog";
import showSnackbar from "../utils/snackbar";
import { useAuth } from "../context/AuthContext";
import { COMANDA_STATUS, comandaStatusLabel, ehDoGrupo } from "../utils/grupos";
import { parseApiDate } from "../utils/datetime";
import { listComandas, createComanda, updateComanda, cancelComanda, deleteComanda } from "../services/comandaService";
import { listClientes } from "../services/clienteService";
import { listFuncionarios } from "../services/funcionarioService";
import { apiErrorMessage } from "../services/api";

// Estado inicial dos filtros (vazio = sem filtro). Bate com os query params da API:
// id, comanda, status, funcionario_id, cliente_id, data_inicio, data_fim.
const FILTROS_VAZIOS = {
  id: "",
  comanda: "",
  status: "",
  funcionario_id: "",
  cliente_id: "",
  data_inicio: "",
  data_fim: "",
};

const StatusChip = ({ status }) => {
  const map = {
    0: ["chip-good", "var(--good)"], // Aberta — verde
    1: ["chip-bad", "var(--bad)"],   // Fechada — vermelho
    2: ["chip-warn", "var(--warn)"], // Cancelada — laranja
  };
  const [cls, color] = map[status] ?? map[0];
  return (
    <span className={`chip ${cls}`}>
      <span className="dot" style={{ background: color, width: 6, height: 6 }} />
      {comandaStatusLabel(status)}
    </span>
  );
};

const fmtData = (iso) => {
  if (!iso) return "—";
  const d = parseApiDate(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
};

const TAMANHOS_PAGINA = [5, 10, 20, 50];

const ComandaList = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const podeAdmin = ehDoGrupo(usuario, [1]);
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAcao, setConfirmAcao] = useState("cancel"); // "cancel" | "delete"
  const [selected, setSelected] = useState(null);

  // Filtros
  const [filtrosOpen, setFiltrosOpen] = useState(true);
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS); // valores dos campos (rascunho)
  const [aplicados, setAplicados] = useState(FILTROS_VAZIOS); // últimos filtros enviados à API
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);

  // Paginação (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog de criar/editar comanda
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null = criação
  const [novaComanda, setNovaComanda] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [saving, setSaving] = useState(false);

  // Filtros enviados à API (os que ela trata corretamente): id, status, funcionário, cliente.
  const montarParams = (f) => {
    const p = {};
    if (f.id) p.id = Number(f.id);
    if (f.status !== "") p.status = Number(f.status);
    if (f.funcionario_id) p.funcionario_id = Number(f.funcionario_id);
    if (f.cliente_id) p.cliente_id = Number(f.cliente_id);
    return p;
  };

  // Filtros aplicados no cliente: comanda é VARCHAR (ex: "Mesa 4") e as datas
  // filtram sobre data_hora — a API atual não suporta esses dois com segurança.
  const filtrarLocal = (lista, f) => {
    const termo = f.comanda.trim().toLowerCase();
    const ini = f.data_inicio ? new Date(`${f.data_inicio}T00:00:00`) : null;
    const fim = f.data_fim ? new Date(`${f.data_fim}T23:59:59.999`) : null;
    return lista.filter((c) => {
      if (termo && !String(c.comanda ?? "").toLowerCase().includes(termo)) return false;
      if (ini || fim) {
        const d = c.data_hora ? parseApiDate(c.data_hora) : null;
        if (!d) return false;
        if (ini && d < ini) return false;
        if (fim && d > fim) return false;
      }
      return true;
    });
  };

  const carregar = useCallback(async (f) => {
    setLoading(true);
    try {
      const data = await listComandas(montarParams(f));
      setComandas(filtrarLocal(data, f));
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao carregar comandas."), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial (sem filtros) + listas para os selects de funcionário/cliente.
  useEffect(() => {
    carregar(FILTROS_VAZIOS);
    listFuncionarios().then(setFuncionarios).catch(() => setFuncionarios([]));
    listClientes().then(setClientes).catch(() => setClientes([]));
  }, [carregar]);

  const setCampo = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const aplicarFiltros = (e) => {
    e?.preventDefault();
    setAplicados(filtros);
    setPage(1);
    carregar(filtros);
  };

  const limparFiltros = () => {
    setFiltros(FILTROS_VAZIOS);
    setAplicados(FILTROS_VAZIOS);
    setPage(1);
    carregar(FILTROS_VAZIOS);
  };

  const recarregar = () => carregar(aplicados); // mantém os filtros ativos após ações
  const filtrosAtivos = Object.values(aplicados).filter((v) => v !== "").length;

  // Paginação derivada da lista já filtrada.
  const totalPaginas = Math.max(1, Math.ceil(comandas.length / pageSize));
  const paginaAtual = Math.min(page, totalPaginas);
  const inicio = (paginaAtual - 1) * pageSize;
  const comandasPagina = comandas.slice(inicio, inicio + pageSize);

  const abrirDialogCriar = () => {
    setEditId(null);
    setNovaComanda("");
    setClienteId("");
    setDialogOpen(true);
  };

  const abrirDialogEditar = (c) => {
    setEditId(c.id);
    setNovaComanda(c.comanda ?? "");
    setClienteId(c.cliente_id ?? "");
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    if (!novaComanda.trim()) {
      showSnackbar("Informe a identificação da comanda (ex: Mesa 4).", "error");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateComanda(editId, {
          comanda: novaComanda.trim(),
          cliente_id: clienteId ? Number(clienteId) : null,
        });
        showSnackbar("Comanda atualizada com sucesso.", "success");
        setDialogOpen(false);
        recarregar();
      } else {
        const payload = {
          comanda: novaComanda.trim(),
          status: COMANDA_STATUS.ABERTA,
          funcionario_id: usuario.id,
        };
        if (clienteId) payload.cliente_id = Number(clienteId);
        const nova = await createComanda(payload);
        showSnackbar("Comanda aberta com sucesso.", "success");
        setDialogOpen(false);
        navigate(`/comanda/${nova.id}`);
      }
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao salvar comanda."), "error");
    } finally {
      setSaving(false);
    }
  };

  const pedirCancelar = (c) => { setSelected(c); setConfirmAcao("cancel"); setConfirmOpen(true); };
  const pedirExcluir = (c) => { setSelected(c); setConfirmAcao("delete"); setConfirmOpen(true); };

  const handleConfirm = async () => {
    try {
      if (confirmAcao === "delete") {
        await deleteComanda(selected.id);
        showSnackbar(`Comanda ${selected.comanda} excluída.`, "success");
      } else {
        await cancelComanda(selected.id);
        showSnackbar(`Comanda ${selected.comanda} cancelada.`, "warning");
      }
      setConfirmOpen(false);
      setSelected(null);
      recarregar();
    } catch (error) {
      const fallback = confirmAcao === "delete" ? "Erro ao excluir comanda." : "Erro ao cancelar comanda.";
      showSnackbar(apiErrorMessage(error, fallback), "error");
      setConfirmOpen(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="section-eyebrow">operação</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", margin: "4px 0 0", color: "var(--ink)" }}>
            Comandas <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>· {comandas.length}</span>
          </h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-accent btn-lg" onClick={abrirDialogCriar}>
            <Plus size={16} /> Abrir comanda
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card card-pad filters">
        <div className="filters-head" onClick={() => setFiltrosOpen((o) => !o)}>
          <div className="filters-title">
            <SlidersHorizontal size={16} />
            Opções de Filtros
            {filtrosAtivos > 0 && <span className="filters-badge">{filtrosAtivos} ativo{filtrosAtivos > 1 ? "s" : ""}</span>}
          </div>
          <ChevronDown
            size={18}
            style={{ color: "var(--ink-3)", transition: "transform 0.2s ease", transform: filtrosOpen ? "rotate(180deg)" : "none" }}
          />
        </div>

        {filtrosOpen && (
          <form className="filters-grid" onSubmit={aplicarFiltros}>
            <div className="field">
              <label className="field-label">ID</label>
              <input className="fld" type="number" placeholder="Ex: 12" value={filtros.id} onChange={setCampo("id")} />
            </div>
            <div className="field">
              <label className="field-label">Comanda</label>
              <input className="fld" type="text" placeholder="Ex: Mesa 4" value={filtros.comanda} onChange={setCampo("comanda")} />
            </div>
            <div className="field">
              <label className="field-label">Status</label>
              <select className="fld" value={filtros.status} onChange={setCampo("status")}>
                <option value="">Todos</option>
                <option value={COMANDA_STATUS.ABERTA}>Aberta</option>
                <option value={COMANDA_STATUS.FECHADA}>Fechada</option>
                <option value={COMANDA_STATUS.CANCELADA}>Cancelada</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Funcionário</label>
              <select className="fld" value={filtros.funcionario_id} onChange={setCampo("funcionario_id")}>
                <option value="">Todos</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Cliente</label>
              <select className="fld" value={filtros.cliente_id} onChange={setCampo("cliente_id")}>
                <option value="">Todos</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Data Inicial</label>
              <input className="fld" type="date" value={filtros.data_inicio} onChange={setCampo("data_inicio")} />
            </div>
            <div className="field">
              <label className="field-label">Data Final</label>
              <input className="fld" type="date" value={filtros.data_fim} onChange={setCampo("data_fim")} />
            </div>
            <div className="field">
              <label className="field-label" style={{ visibility: "hidden" }}>Ações</label>
              <div className="filters-actions">
                <button type="button" className="btn btn-ghost" onClick={limparFiltros}>
                  <X size={14} /> Limpar
                </button>
                <button type="submit" className="btn btn-primary">
                  Filtrar
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Carregando…</div>
      ) : comandas.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-3)" }}>
          {filtrosAtivos > 0 ? "Nenhuma comanda encontrada para os filtros aplicados." : "Nenhuma comanda cadastrada."}
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>comanda</th>
                  <th>abertura</th>
                  <th>cliente</th>
                  <th>status</th>
                  <th>ações</th>
                </tr>
              </thead>
              <tbody>
                {comandasPagina.map((c) => {
                  const aberta = c.status === COMANDA_STATUS.ABERTA;
                  return (
                    <tr key={c.id}>
                      <td className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{c.comanda}</td>
                      <td className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{fmtData(c.data_hora)}</td>
                      <td style={{ fontSize: 13 }}>{c.cliente?.nome || (c.cliente_id ?? "—")}</td>
                      <td><StatusChip status={c.status} /></td>
                      <td>
                        <div className="row-actions">
                          <button className="act act-view" title="Visualizar"
                            onClick={() => navigate(`/comanda/${c.id}`)}>
                            <Eye size={16} />
                          </button>
                          {podeAdmin && (
                            <button className="act act-edit" title="Editar"
                              onClick={() => abrirDialogEditar(c)}>
                              <Pencil size={15} />
                            </button>
                          )}
                          {podeAdmin && (
                            <button className="act act-delete" title="Excluir"
                              onClick={() => pedirExcluir(c)}>
                              <Trash2 size={15} />
                            </button>
                          )}
                          <button className="act act-add" title="Adicionar item" disabled={!aberta}
                            onClick={() => navigate(`/comanda/${c.id}`)}>
                            <PlusCircle size={16} />
                          </button>
                          {podeAdmin && (
                            <button className="act act-cancel" title="Cancelar" disabled={!aberta}
                              onClick={() => pedirCancelar(c)}>
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="pagination">
            <div className="pagination-nav">
              <button className="page-link" disabled={paginaAtual <= 1} onClick={() => setPage(paginaAtual - 1)}>
                <ChevronLeft size={15} /> Anterior
              </button>
              <span>Página <span className="page-current">{paginaAtual}</span> de {totalPaginas}</span>
              <button className="page-link" disabled={paginaAtual >= totalPaginas} onClick={() => setPage(paginaAtual + 1)}>
                Próxima <ChevronRight size={15} />
              </button>
            </div>
            <div className="page-size">
              <span>Itens por página:</span>
              <select
                className="fld"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                {TAMANHOS_PAGINA.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Dialog criar/editar comanda */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? "Editar comanda" : "Abrir nova comanda"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            label="Identificação (ex: Mesa 4, Balcão 1)"
            value={novaComanda}
            onChange={(e) => setNovaComanda(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 30 }}
          />
          <TextField
            select
            label="Cliente (opcional)"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            fullWidth
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">Sem cliente</MenuItem>
            {clientes.map((cl) => (
              <MenuItem key={cl.id} value={cl.id}>{cl.nome}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" disabled={saving}>Cancelar</Button>
          <Button onClick={handleSalvar} variant="contained" disabled={saving}>
            {saving ? "Salvando…" : editId ? "Salvar" : "Abrir comanda"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmAcao === "delete" ? "Excluir Comanda" : "Cancelar Comanda"}
        message={
          confirmAcao === "delete"
            ? `Deseja excluir a comanda ${selected?.comanda}? Esta ação não pode ser desfeita.`
            : `Deseja cancelar a comanda ${selected?.comanda}?`
        }
        confirmLabel={confirmAcao === "delete" ? "Excluir" : "Cancelar Comanda"}
        cancelLabel="Voltar"
        severity="warning"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ComandaList;
