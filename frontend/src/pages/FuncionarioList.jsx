import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/common/ConfirmDialog";
import showSnackbar from "../utils/snackbar";
import { grupoLabel, iniciais } from "../utils/grupos";
import { listFuncionarios, deleteFuncionario } from "../services/funcionarioService";
import { apiErrorMessage } from "../services/api";

const formatCpf = (cpf = "") => {
  const d = String(cpf).replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const FuncionarioList = () => {
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setFuncionarios(await listFuncionarios());
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao carregar funcionários."), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleDelete = async () => {
    try {
      await deleteFuncionario(selected.id);
      showSnackbar(`Funcionário "${selected.nome}" removido.`, "success");
      setConfirmOpen(false);
      setSelected(null);
      carregar();
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao remover funcionário."), "error");
      setConfirmOpen(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="section-eyebrow">equipe · {funcionarios.length} cadastrados</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", margin: "4px 0 0", color: "var(--ink)" }}>
            Funcionários
          </h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-accent btn-lg" onClick={() => navigate("/funcionario")}>
            <Plus size={16} /> Novo funcionário
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Carregando…</div>
      ) : funcionarios.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-3)" }}>
          Nenhum funcionário cadastrado.
        </div>
      ) : (
        <div className="card-grid-2">
          {funcionarios.map((p) => (
            <div key={p.id} className="card card-pad" style={{ display: "flex", gap: 16 }}>
              <div style={{ flexShrink: 0 }}>
                <div className="avatar" style={{ width: 52, height: 52, fontSize: 14, background: "var(--accent-bg)", color: "var(--accent)", borderColor: "var(--accent)" }}>
                  {iniciais(p.nome)}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{p.nome}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                      <span className="chip" style={{ fontSize: 10, padding: "1px 7px" }}>{grupoLabel(p.grupo)}</span>
                      <span style={{ marginLeft: 8 }}>matrícula {p.matricula}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button className="btn-icon" style={{ width: 30, height: 30 }} title="Editar"
                      onClick={() => navigate(`/funcionario/${p.id}`)}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn-icon" style={{ width: 30, height: 30 }} title="Excluir"
                      onClick={() => { setSelected(p); setConfirmOpen(true); }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 18, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                  <div>
                    <div className="kpi-label" style={{ fontSize: 9 }}>cpf</div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{formatCpf(p.cpf)}</div>
                  </div>
                  <div>
                    <div className="kpi-label" style={{ fontSize: 9 }}>telefone</div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{p.telefone}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir Funcionário"
        message={`Tem certeza que deseja excluir "${selected?.nome}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default FuncionarioList;
