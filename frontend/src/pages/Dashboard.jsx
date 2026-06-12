//Leonardo Stuani Godoi
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, Users, Package, Receipt } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { COMANDA_STATUS, comandaStatusLabel } from "../utils/grupos";
import { parseApiDate } from "../utils/datetime";
import { listComandas, listComandaProdutos } from "../services/comandaService";
import { listProdutos } from "../services/produtoService";
import { listClientes } from "../services/clienteService";
import { listFuncionarios } from "../services/funcionarioService";

const now = new Date();
const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dateStr = now.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

const fmtData = (iso) => {
  if (!iso) return "—";
  return parseApiDate(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const mesmaData = (a, b) => {
  const d = parseApiDate(a);
  return d.getDate() === b.getDate() && d.getMonth() === b.getMonth() && d.getFullYear() === b.getFullYear();
};

const KPICard = ({ label, value, sub, accent }) => (
  <div className="card card-pad" style={{ position: "relative", overflow: "hidden" }}>
    {accent && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--accent)" }} />}
    <div className="kpi-label" style={{ marginBottom: 8 }}>{label}</div>
    <div className="kpi-value" style={accent ? { color: "var(--accent)" } : {}}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>{sub}</div>}
  </div>
);

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

const BarChart = ({ serie, height = 160 }) => {
  const max = Math.max(...serie.map((s) => s.total), 1);
  return (
    <div className="bar-chart" style={{ height }}>
      {serie.map((s, i) => {
        const isHi = i === serie.length - 1;
        const h = s.total > 0 ? Math.max(6, Math.round((s.total / max) * 100)) : 2;
        return (
          <div key={i} className="bar-col" title={fmt(s.total)}>
            <div className="bar-track">
              <div className={"bar-fill" + (isHi ? " hi" : "")} style={{ height: `${h}%` }} />
            </div>
            <div className={"bar-label" + (isHi ? " hi" : "")}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const firstName = usuario?.nome?.split(" ")[0] ?? "operador";

  const [comandas, setComandas] = useState([]); // todas, com { itens, total }
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ produtos: 0, clientes: 0, funcionarios: 0 });

  useEffect(() => {
    (async () => {
      try {
        const todas = await listComandas({ limit: 1000 });
        const comTotais = await Promise.all(
          todas.map(async (c) => {
            let itens;
            try {
              itens = await listComandaProdutos(c.id);
            } catch {
              itens = [];
            }
            const total = itens.reduce((acc, i) => acc + Number(i.quantidade) * Number(i.valor_unitario), 0);
            return { ...c, itens, total };
          }),
        );
        setComandas(comTotais);
      } catch {
        setComandas([]);
      } finally {
        setLoading(false);
      }
    })();

    listProdutos().then((p) => setCounts((c) => ({ ...c, produtos: p.length }))).catch(() => {});
    listClientes().then((p) => setCounts((c) => ({ ...c, clientes: p.length }))).catch(() => {});
    listFuncionarios().then((p) => setCounts((c) => ({ ...c, funcionarios: p.length }))).catch(() => {});
  }, []);

  const m = useMemo(() => {
    const abertas = comandas.filter((c) => c.status === COMANDA_STATUS.ABERTA);
    const fechadas = comandas.filter((c) => c.status === COMANDA_STATUS.FECHADA);
    const canceladas = comandas.filter((c) => c.status === COMANDA_STATUS.CANCELADA);
    const totalAberto = abertas.reduce((acc, c) => acc + c.total, 0);
    const hoje = new Date();
    const fechadasHoje = fechadas.filter((c) => mesmaData(c.data_hora, hoje));
    const faturamentoHoje = fechadasHoje.reduce((acc, c) => acc + c.total, 0);
    const faturamentoTotal = fechadas.reduce((acc, c) => acc + c.total, 0);
    const ticketMedio = fechadas.length ? faturamentoTotal / fechadas.length : 0;

    // Série dos últimos 7 dias (faturamento de comandas fechadas por dia de abertura).
    const serie = [...Array(7)].map((_, idx) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - idx));
      const total = fechadas
        .filter((c) => mesmaData(c.data_hora, d))
        .reduce((acc, c) => acc + c.total, 0);
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).charAt(0).toUpperCase();
      return { date: d, total, label };
    });
    const total7 = serie.reduce((acc, s) => acc + s.total, 0);

    // Top produtos por quantidade vendida (todas as comandas).
    const mapProd = new Map();
    comandas.forEach((c) =>
      c.itens.forEach((i) => {
        const prev = mapProd.get(i.produto_id) || { nome: i.produto?.nome || `Produto #${i.produto_id}`, qtd: 0, receita: 0 };
        prev.qtd += Number(i.quantidade);
        prev.receita += Number(i.quantidade) * Number(i.valor_unitario);
        mapProd.set(i.produto_id, prev);
      }),
    );
    const topProdutos = [...mapProd.values()].sort((a, b) => b.qtd - a.qtd).slice(0, 5);
    const maxQtd = Math.max(...topProdutos.map((p) => p.qtd), 1);

    return {
      abertas, fechadas, canceladas, totalAberto, faturamentoHoje, fechadasHoje,
      faturamentoTotal, ticketMedio, serie, total7, topProdutos, maxQtd,
    };
  }, [comandas]);

  return (
    <div className="page-content">
      {/* Hero */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <div className="section-eyebrow">{dateStr} · {timeStr}</div>
          <h1 className="serif" style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", margin: "6px 0 0", lineHeight: 1.05, color: "var(--ink)" }}>
            Olá, <span style={{ color: "var(--accent)" }}>{firstName}</span>.
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 8, margin: "8px 0 0" }}>
            Você tem <span style={{ color: "var(--accent)", fontWeight: 600 }}>{m.abertas.length}</span> comanda(s) em aberto
            {m.totalAberto > 0 && <> · <span style={{ fontWeight: 600 }}>{fmt(m.totalAberto)}</span> a receber</>}.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-accent btn-lg" onClick={() => navigate("/comandas")}>
            <Plus size={16} /> Nova comanda
          </button>
        </div>
      </div>

      {/* KPIs reais */}
      <div className="kpi-grid" style={{ marginBottom: 22 }}>
        <KPICard label="Comandas abertas" value={String(m.abertas.length)} sub={`${fmt(m.totalAberto)} a receber`} accent />
        <KPICard label="Faturamento hoje" value={fmt(m.faturamentoHoje)} sub={`${m.fechadasHoje.length} comanda(s) fechada(s) hoje`} />
        <KPICard label="Ticket médio" value={fmt(m.ticketMedio)} sub={`média de ${m.fechadas.length} comanda(s) fechada(s)`} />
        <KPICard label="Faturamento acumulado" value={fmt(m.faturamentoTotal)} sub="todas as comandas fechadas" />
      </div>

      {/* Faturamento + comandas abertas */}
      <div className="dash-split" style={{ marginBottom: 18 }}>
        <div className="card card-pad">
          <div className="section-title">
            <div>
              <div className="section-eyebrow">faturamento · últimos 7 dias</div>
              <h2>Vendas</h2>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
            <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.025em" }}>{fmt(m.total7)}</div>
            <span className="chip chip-good"><TrendingUp size={11} /> no período</span>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Carregando…</div>
          ) : (
            <BarChart serie={m.serie} />
          )}
        </div>

        {/* Comandas abertas (reais) */}
        <div className="card card-pad">
          <div className="section-title">
            <div>
              <div className="section-eyebrow">agora · {m.abertas.length} abertas</div>
              <h2>Comandas</h2>
            </div>
            <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
              onClick={() => navigate("/comandas")}>
              Ver todas →
            </span>
          </div>
          {m.abertas.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
              Nenhuma comanda aberta.
            </div>
          ) : (
            m.abertas.slice(0, 6).map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid var(--line)", cursor: "pointer" }}
                onClick={() => navigate(`/comanda/${c.id}`)}>
                <div style={{
                  minWidth: 42, height: 42, borderRadius: 10, padding: "0 8px",
                  border: "1.5px solid var(--ink)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
                }}>
                  {c.comanda}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.cliente?.nome || "Sem cliente"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "JetBrains Mono, monospace" }}>
                    {fmtData(c.data_hora)} · {c.funcionario?.nome || "—"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--good)" }}>{fmt(c.total)}</div>
                  <div style={{ marginTop: 2 }}><StatusChip status={c.status} /></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top produtos + cadastros */}
      <div className="dash-split">
        <div className="card card-pad">
          <div className="section-title">
            <div>
              <div className="section-eyebrow">mais vendidos · por quantidade</div>
              <h2>Top produtos</h2>
            </div>
          </div>
          {m.topProdutos.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
              Nenhum item lançado ainda.
            </div>
          ) : (
            m.topProdutos.map((p, idx) => (
              <div key={idx} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>
                    <span className="mono" style={{ color: "var(--ink-3)", marginRight: 8 }}>{idx + 1}.</span>
                    {p.nome}
                  </span>
                  <span className="mono" style={{ color: "var(--ink-3)", fontSize: 12 }}>
                    {p.qtd}× · {fmt(p.receita)}
                  </span>
                </div>
                <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.round((p.qtd / m.maxQtd) * 100)}%`, background: idx === 0 ? "var(--accent)" : "var(--ink-3)", borderRadius: 4 }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card card-pad">
          <div className="section-title">
            <div>
              <div className="section-eyebrow">visão geral</div>
              <h2>Cadastros & comandas</h2>
            </div>
          </div>
          <div className="kpi-grid-3" style={{ marginTop: 6 }}>
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <Package size={20} style={{ color: "var(--accent)" }} />
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{counts.produtos}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>produtos</div>
            </div>
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <Users size={20} style={{ color: "var(--accent)" }} />
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{counts.clientes}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>clientes</div>
            </div>
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <Receipt size={20} style={{ color: "var(--accent)" }} />
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{counts.funcionarios}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>equipe</div>
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <StatusChip status={0} />
              <span className="mono" style={{ fontWeight: 600 }}>{m.abertas.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <StatusChip status={1} />
              <span className="mono" style={{ fontWeight: 600 }}>{m.fechadas.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <StatusChip status={2} />
              <span className="mono" style={{ fontWeight: 600 }}>{m.canceladas.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;