import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/common/ConfirmDialog";
import showSnackbar from "../utils/snackbar";
import { iniciais, ehDoGrupo } from "../utils/grupos";
import { useAuth } from "../context/AuthContext";
import { listClientes, deleteCliente } from "../services/clienteService";
import { apiErrorMessage } from "../services/api";

const formatCpf = (cpf = "") => {
  const d = String(cpf).replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const KPICard = ({ label, value, sub, accent }) => (
  <div className="card card-pad" style={{ position: "relative", overflow: "hidden" }}>
    {accent && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--accent)" }} />}
    <div className="kpi-label" style={{ marginBottom: 8 }}>{label}</div>
    <div className="kpi-value" style={accent ? { color: "var(--accent)" } : {}}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>{sub}</div>}
  </div>
);

const ClienteList = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const podeCriarEditar = ehDoGrupo(usuario, [1, 3]);
  const podeExcluir = ehDoGrupo(usuario, [1]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setClientes(await listClientes());
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao carregar clientes."), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleDelete = async () => {
    try {
      await deleteCliente(selected.id);
      showSnackbar(`Cliente "${selected.nome}" removido.`, "success");
      setConfirmOpen(false);
      setSelected(null);
      carregar();
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao remover cliente."), "error");
      setConfirmOpen(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="section-eyebrow">cadastro · {clientes.length} ativos</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", margin: "4px 0 0", color: "var(--ink)" }}>
            Clientes
          </h1>
        </div>
        {podeCriarEditar && (
          <div className="page-header-actions">
            <button className="btn btn-accent btn-lg" onClick={() => navigate("/cliente")}>
              <Plus size={16} /> Novo cliente
            </button>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="kpi-grid-3" style={{ marginBottom: 18 }}>
        <KPICard label="Clientes cadastrados" value={String(clientes.length)} sub="total na base" accent />
        <KPICard label="Com endereço" value={String(clientes.filter((c) => c.endereco).length)} sub="entrega disponível" />
        <KPICard label="Com telefone" value={String(clientes.filter((c) => c.telefone).length)} sub="contato cadastrado" />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Carregando…</div>
      ) : clientes.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-3)" }}>
          Nenhum cliente cadastrado.
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>cliente</th>
                  <th>cpf</th>
                  <th>contato</th>
                  <th>endereço</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} style={{ cursor: podeCriarEditar ? "pointer" : "default" }}
                    onClick={() => podeCriarEditar && navigate(`/cliente/${c.id}`)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar" style={{ width: 36, height: 36, fontSize: 11 }}>{iniciais(c.nome)}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nome}</div>
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{formatCpf(c.cpf)}</td>
                    <td className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{c.telefone}</td>
                    <td style={{ fontSize: 12, color: "var(--ink-3)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.endereco}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {podeCriarEditar && (
                          <button className="btn-icon" style={{ width: 32, height: 32 }} title="Editar"
                            onClick={() => navigate(`/cliente/${c.id}`)}>
                            <Pencil size={14} />
                          </button>
                        )}
                        {podeExcluir && (
                          <button className="btn-icon" style={{ width: 32, height: 32 }} title="Excluir"
                            onClick={() => { setSelected(c); setConfirmOpen(true); }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                        {!podeCriarEditar && !podeExcluir && (
                          <span style={{ fontSize: 11, color: "var(--ink-4)" }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir "${selected?.nome}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ClienteList;
