import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/common/ConfirmDialog";
import showSnackbar from "../utils/snackbar";
import { ehDoGrupo } from "../utils/grupos";
import { useAuth } from "../context/AuthContext";
import { listProdutos, deleteProduto } from "../services/produtoService";
import { apiErrorMessage } from "../services/api";
import { produtoFotoSrc } from "../utils/produtoFoto";

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

const ProdutoList = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const podeGerenciar = ehDoGrupo(usuario, [1]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setProdutos(await listProdutos());
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao carregar produtos."), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleDelete = async () => {
    try {
      await deleteProduto(selected.id_produto);
      showSnackbar(`Produto "${selected.nome}" removido.`, "success");
      setConfirmOpen(false);
      setSelected(null);
      carregar();
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao remover produto."), "error");
      setConfirmOpen(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="section-eyebrow">cardápio</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", margin: "4px 0 0", color: "var(--ink)" }}>
            Produtos <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>· {produtos.length}</span>
          </h1>
        </div>
        {podeGerenciar && (
          <div className="page-header-actions">
            <button className="btn btn-accent btn-lg" onClick={() => navigate("/produto")}>
              <Plus size={16} /> Novo produto
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Carregando…</div>
      ) : produtos.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-3)" }}>
          Nenhum produto cadastrado.
        </div>
      ) : (
        <div className="card-grid-4">
          {produtos.map((p) => (
            <div
              key={p.id_produto}
              className="card"
              style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}
            >
              {produtoFotoSrc(p.foto) ? (
                <img
                  src={produtoFotoSrc(p.foto)}
                  alt={p.nome}
                  loading="lazy"
                  style={{ height: 110, width: "100%", objectFit: "cover", borderRadius: 8, display: "block" }}
                />
              ) : (
                <div className="hatch" style={{ height: 110 }}>sem foto</div>
              )}
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.nome}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, minHeight: 28, overflow: "hidden" }}>
                  {p.descricao}
                </div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 10, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                  {fmt(p.valor_unitario)}
                </div>
              </div>
              {podeGerenciar && (
                <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}
                    onClick={() => navigate(`/produto/${p.id_produto}`)}>
                    <Pencil size={13} /> Editar
                  </button>
                  <button className="btn-icon" style={{ width: 32, height: 32 }} title="Excluir"
                    onClick={() => { setSelected(p); setConfirmOpen(true); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir "${selected?.nome}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ProdutoList;
