//Leonardo Stuani Godoi
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
          {produtos.map((p) => {
            const src = produtoFotoSrc(p.foto);
            return (
              <div key={p.id_produto} className="card prod-card">
                <div className="prod-card__media">
                  {src ? (
                    <img src={src} alt={p.nome} loading="lazy" className="prod-card__img" />
                  ) : (
                    <div className="hatch prod-card__img">sem foto</div>
                  )}
                </div>
                <div className="prod-card__body">
                  <div className="prod-card__top">
                    <span className="prod-card__name">{p.nome}</span>
                    <span className="prod-card__price">{fmt(p.valor_unitario)}</span>
                  </div>
                  <div className="prod-card__desc">{p.descricao}</div>
                </div>
                {podeGerenciar && (
                  <div className="prod-card__actions">
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}
                      onClick={() => navigate(`/produto/${p.id_produto}`)}>
                      <Pencil size={13} /> Editar
                    </button>
                    <button className="btn-icon" style={{ width: 30, height: 30 }} title="Excluir"
                      onClick={() => { setSelected(p); setConfirmOpen(true); }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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