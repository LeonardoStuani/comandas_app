import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button,
} from "@mui/material";
import { ArrowLeft, Plus, Pencil, Trash2, Wallet, Ban } from "lucide-react";
import ConfirmDialog from "../components/common/ConfirmDialog";
import showSnackbar from "../utils/snackbar";
import { useAuth } from "../context/AuthContext";
import { COMANDA_STATUS, comandaStatusLabel, ehDoGrupo } from "../utils/grupos";
import {
  getComanda, listComandaProdutos, addComandaProduto,
  removeComandaProduto, updateComandaProduto, updateComanda, cancelComanda,
} from "../services/comandaService";
import { listProdutos } from "../services/produtoService";
import { apiErrorMessage } from "../services/api";

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

const StatusChip = ({ status }) => {
  const map = { 0: ["chip-accent", "var(--accent)"], 1: ["chip-good", "var(--good)"], 2: ["chip", "var(--ink-3)"] };
  const [cls, color] = map[status] ?? map[0];
  return (
    <span className={`chip ${cls}`}>
      <span className="dot" style={{ background: color, width: 6, height: 6 }} />
      {comandaStatusLabel(status)}
    </span>
  );
};

const ComandaAberta = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario } = useAuth();

  const [comanda, setComanda] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog adicionar item
  const [addOpen, setAddOpen] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState("");
  const [adding, setAdding] = useState(false);

  // Dialog editar item
  const [editTarget, setEditTarget] = useState(null);
  const [editQtd, setEditQtd] = useState(1);
  const [editValor, setEditValor] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Confirmações
  const [removeTarget, setRemoveTarget] = useState(null);
  const [fecharOpen, setFecharOpen] = useState(false);
  const [cancelarOpen, setCancelarOpen] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [c, list] = await Promise.all([getComanda(id), listComandaProdutos(id)]);
      setComanda(c);
      setItens(list);
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao carregar comanda."), "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const total = itens.reduce((acc, i) => acc + Number(i.quantidade) * Number(i.valor_unitario), 0);
  const isAberta = comanda?.status === COMANDA_STATUS.ABERTA;
  const podeAdmin = ehDoGrupo(usuario, [1]);

  const abrirDialogAdd = async () => {
    setProdutoId("");
    setQuantidade(1);
    setValorUnitario("");
    setAddOpen(true);
    try {
      setProdutos(await listProdutos());
    } catch {
      setProdutos([]);
    }
  };

  const onSelectProduto = (pid) => {
    setProdutoId(pid);
    const p = produtos.find((x) => x.id_produto === Number(pid));
    if (p) setValorUnitario(String(p.valor_unitario));
  };

  const handleAdd = async () => {
    if (!produtoId) { showSnackbar("Selecione um produto.", "error"); return; }
    if (Number(quantidade) <= 0) { showSnackbar("Quantidade deve ser maior que zero.", "error"); return; }
    setAdding(true);
    try {
      await addComandaProduto(id, {
        produto_id: Number(produtoId),
        funcionario_id: usuario.id,
        quantidade: Number(quantidade),
        valor_unitario: Number(valorUnitario),
      });
      showSnackbar("Item lançado na comanda.", "success");
      setAddOpen(false);
      carregar();
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao lançar item."), "error");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeComandaProduto(removeTarget.id);
      showSnackbar("Item removido.", "success");
      setRemoveTarget(null);
      carregar();
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao remover item."), "error");
      setRemoveTarget(null);
    }
  };

  const abrirEditarItem = (item) => {
    setEditTarget(item);
    setEditQtd(item.quantidade);
    setEditValor(String(item.valor_unitario));
  };

  const handleEditItem = async () => {
    if (Number(editQtd) <= 0) { showSnackbar("Quantidade deve ser maior que zero.", "error"); return; }
    if (Number(editValor) < 0) { showSnackbar("Valor unitário inválido.", "error"); return; }
    setSavingEdit(true);
    try {
      await updateComandaProduto(editTarget.id, {
        quantidade: Number(editQtd),
        valor_unitario: Number(editValor),
      });
      showSnackbar("Item atualizado.", "success");
      setEditTarget(null);
      carregar();
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao atualizar item."), "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleFechar = async () => {
    try {
      await updateComanda(id, { status: COMANDA_STATUS.FECHADA });
      showSnackbar("Conta fechada com sucesso.", "success");
      setFecharOpen(false);
      navigate("/comandas");
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao fechar conta."), "error");
      setFecharOpen(false);
    }
  };

  const handleCancelar = async () => {
    try {
      await cancelComanda(id);
      showSnackbar("Comanda cancelada.", "warning");
      setCancelarOpen(false);
      navigate("/comandas");
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao cancelar comanda."), "error");
      setCancelarOpen(false);
    }
  };

  if (loading) {
    return <div className="page-content"><div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Carregando…</div></div>;
  }
  if (!comanda) {
    return <div className="page-content"><div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-3)" }}>Comanda não encontrada.</div></div>;
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="section-eyebrow">
            comanda #{comanda.comanda} · por {comanda.funcionario?.nome || "—"}
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em",
            margin: "4px 0 0", display: "flex", alignItems: "center", gap: 12, color: "var(--ink)",
          }}>
            {comanda.comanda}
            {comanda.cliente?.nome ? ` — ${comanda.cliente.nome}` : ""}
            <StatusChip status={comanda.status} />
          </h1>
        </div>
      </div>

      <div className="split-aside">
        {/* Items */}
        <div className="card card-pad">
          <div className="section-title">
            <div>
              <div className="section-eyebrow">{itens.length} {itens.length === 1 ? "item" : "itens"}</div>
              <h2>Itens lançados</h2>
            </div>
            {isAberta && (
              <button className="btn btn-accent" onClick={abrirDialogAdd}>
                <Plus size={15} /> Lançar item
              </button>
            )}
          </div>

          <div style={{ marginTop: 6 }}>
            {itens.length === 0 ? (
              <div style={{ padding: "28px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
                Nenhum item lançado ainda.
              </div>
            ) : (
              itens.map((item) => (
                <div key={item.id} style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr auto auto",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 0",
                  borderBottom: "1px solid var(--line)",
                }}>
                  <div style={{
                    width: 36, height: 36,
                    border: "1.5px solid var(--line-2)",
                    borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
                  }}>
                    {item.quantidade}×
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.produto?.nome || `Produto #${item.produto_id}`}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {fmt(item.valor_unitario)} un · {item.funcionario?.nome || "—"}
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>
                    {fmt(Number(item.quantidade) * Number(item.valor_unitario))}
                  </div>
                  {isAberta && podeAdmin ? (
                    <div className="row-actions">
                      <button className="act act-edit" title="Editar item"
                        onClick={() => abrirEditarItem(item)}>
                        <Pencil size={15} />
                      </button>
                      <button className="act act-delete" title="Excluir item"
                        onClick={() => setRemoveTarget(item)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : <span />}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Totals */}
          <div className="card card-pad">
            <div className="section-title">
              <div>
                <div className="section-eyebrow">resumo</div>
                <h2>Total</h2>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, color: "var(--ink-2)" }}>
              <span>Itens</span>
              <span className="mono" style={{ fontWeight: 500 }}>{itens.length}</span>
            </div>
            <div style={{ marginTop: 10, paddingTop: 14, borderTop: "1px dashed var(--line-2)" }}>
              <div className="kpi-label" style={{ marginBottom: 4 }}>Total a pagar</div>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--accent)", lineHeight: 1 }}>
                {fmt(total)}
              </div>
            </div>

            {isAberta ? (
              podeAdmin ? (
                <>
                  <button className="btn btn-accent btn-lg btn-full" style={{ marginTop: 16 }}
                    onClick={() => setFecharOpen(true)}>
                    <Wallet size={16} /> Fechar conta
                  </button>
                  <button className="btn btn-full" style={{ marginTop: 8 }}
                    onClick={() => setCancelarOpen(true)}>
                    <Ban size={15} /> Cancelar comanda
                  </button>
                </>
              ) : (
                <div style={{ marginTop: 16, fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
                  Fechar/cancelar é exclusivo do Caixa/Administrador.
                </div>
              )
            ) : (
              <div style={{ marginTop: 16, fontSize: 13, color: "var(--ink-3)", textAlign: "center" }}>
                Comanda {comandaStatusLabel(comanda.status)} — somente leitura.
              </div>
            )}
          </div>

          {/* Cliente */}
          {comanda.cliente && (
            <div className="card card-pad">
              <div className="section-title">
                <div>
                  <div className="section-eyebrow">cliente</div>
                  <h2>{comanda.cliente.nome}</h2>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, fontSize: 12, color: "var(--ink-3)" }}>
                <span>Telefone</span>
                <span className="mono">{comanda.cliente.telefone}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, fontSize: 12, color: "var(--ink-3)" }}>
                <span>Endereço</span>
                <span className="mono" style={{ maxWidth: 180, textAlign: "right" }}>{comanda.cliente.endereco}</span>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Dialog adicionar item */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Lançar item</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            select label="Produto" value={produtoId}
            onChange={(e) => onSelectProduto(e.target.value)} fullWidth
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">Selecione...</MenuItem>
            {produtos.map((p) => (
              <MenuItem key={p.id_produto} value={p.id_produto}>
                {p.nome} · {fmt(p.valor_unitario)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantidade" type="number" value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)} fullWidth
            inputProps={{ min: 1, step: 1 }}
          />
          <TextField
            label="Valor unitário" type="number" value={valorUnitario}
            onChange={(e) => setValorUnitario(e.target.value)} fullWidth
            inputProps={{ min: 0, step: "0.01" }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined" disabled={adding}>Cancelar</Button>
          <Button onClick={handleAdd} variant="contained" disabled={adding}>
            {adding ? "Lançando…" : "Lançar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog editar item */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Editar item</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Produto"
            value={editTarget?.produto?.nome || `Produto #${editTarget?.produto_id ?? ""}`}
            fullWidth
            disabled
            helperText="Para trocar o produto, remova o item e lance outro."
          />
          <TextField
            label="Quantidade" type="number" value={editQtd}
            onChange={(e) => setEditQtd(e.target.value)} fullWidth autoFocus
            inputProps={{ min: 1, step: 1 }}
          />
          <TextField
            label="Valor unitário" type="number" value={editValor}
            onChange={(e) => setEditValor(e.target.value)} fullWidth
            inputProps={{ min: 0, step: "0.01" }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditTarget(null)} variant="outlined" disabled={savingEdit}>Cancelar</Button>
          <Button onClick={handleEditItem} variant="contained" disabled={savingEdit}>
            {savingEdit ? "Salvando…" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!removeTarget}
        title="Remover item"
        message={`Remover "${removeTarget?.produto?.nome || "item"}" da comanda?`}
        confirmLabel="Remover"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />

      <ConfirmDialog
        open={fecharOpen}
        title="Fechar conta"
        message={`Confirmar o fechamento da comanda #${comanda.comanda} no valor de ${fmt(total)}?`}
        confirmLabel="Fechar conta"
        severity="info"
        onConfirm={handleFechar}
        onCancel={() => setFecharOpen(false)}
      />

      <ConfirmDialog
        open={cancelarOpen}
        title="Cancelar comanda"
        message={`Deseja cancelar a comanda #${comanda.comanda}?`}
        confirmLabel="Cancelar comanda"
        cancelLabel="Voltar"
        severity="warning"
        onConfirm={handleCancelar}
        onCancel={() => setCancelarOpen(false)}
      />
    </div>
  );
};

export default ComandaAberta;
