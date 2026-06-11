import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ShoppingCart, RefreshCw, X, User, Printer, Receipt, CheckCircle2,
} from "lucide-react";
import showSnackbar from "../utils/snackbar";
import { COMANDA_STATUS } from "../utils/grupos";
import { useAuth } from "../context/AuthContext";
import { parseApiDate } from "../utils/datetime";
import { listComandas, listComandaProdutos } from "../services/comandaService";
import { receberComandas, getComprovante } from "../services/recebimentoService";
import { listClientes } from "../services/clienteService";
import { listProdutos } from "../services/produtoService";
import { produtoFotoSrc } from "../utils/produtoFoto";
import { apiErrorMessage } from "../services/api";

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

const fmtHora = (iso) => {
  if (!iso) return "—";
  return parseApiDate(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const fmtDataHora = (d) =>
  d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const FORMAS = ["Dinheiro", "Pix", "Cartão de crédito", "Cartão de débito"];

const CaixaPage = () => {
  const { usuario } = useAuth();
  const [comandas, setComandas] = useState([]); // abertas, com { itens, total }
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [fotos, setFotos] = useState({}); // id_produto -> foto (base64) para exibir nas miniaturas

  const [selectedIds, setSelectedIds] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [desconto, setDesconto] = useState("");
  const [acrescimo, setAcrescimo] = useState("");
  const [forma, setForma] = useState(FORMAS[0]);
  const [finalizando, setFinalizando] = useState(false);

  // Nota gerada (snapshot para impressão)
  const [nota, setNota] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const abertas = await listComandas({ status: COMANDA_STATUS.ABERTA });
      const comItens = await Promise.all(
        abertas.map(async (c) => {
          let itens;
          try {
            itens = await listComandaProdutos(c.id);
          } catch {
            itens = [];
          }
          const total = itens.reduce(
            (acc, i) => acc + Number(i.quantidade) * Number(i.valor_unitario),
            0,
          );
          return { ...c, itens, total };
        }),
      );
      setComandas(comItens);
      // remove da seleção comandas que não estão mais abertas
      setSelectedIds((ids) => ids.filter((id) => comItens.some((c) => c.id === id)));
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao carregar comandas abertas."), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    listClientes().then(setClientes).catch(() => setClientes([]));
    listProdutos()
      .then((list) => setFotos(Object.fromEntries(list.map((p) => [p.id_produto, p.foto]))))
      .catch(() => setFotos({}));
  }, [carregar]);

  const toggle = (id) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const limpar = () => {
    setSelectedIds([]);
    setClienteId("");
    setDesconto("");
    setAcrescimo("");
  };

  const selecionadas = useMemo(
    () => comandas.filter((c) => selectedIds.includes(c.id)),
    [comandas, selectedIds],
  );

  // Itens consolidados (agrupados por produto + valor unitário) das comandas selecionadas.
  const consolidado = useMemo(() => {
    const map = new Map();
    selecionadas.forEach((c) =>
      c.itens.forEach((i) => {
        const valor = Number(i.valor_unitario);
        const key = `${i.produto_id}|${valor}`;
        const prev = map.get(key) || {
          key,
          nome: i.produto?.nome || `Produto #${i.produto_id}`,
          foto: fotos[i.produto_id] ?? i.produto?.foto ?? null,
          valor_unitario: valor,
          quantidade: 0,
        };
        prev.quantidade += Number(i.quantidade);
        map.set(key, prev);
      }),
    );
    return [...map.values()];
  }, [selecionadas, fotos]);

  const subtotal = useMemo(
    () => selecionadas.reduce((acc, c) => acc + c.total, 0),
    [selecionadas],
  );
  const descontoNum = Number(desconto) || 0;
  const acrescimoNum = Number(acrescimo) || 0;
  const totalFinal = Math.max(0, subtotal - descontoNum + acrescimoNum);

  const clienteSelecionado = clientes.find((c) => String(c.id) === String(clienteId)) || null;

  const finalizar = async () => {
    if (selecionadas.length === 0) {
      showSnackbar("Selecione ao menos uma comanda.", "error");
      return;
    }
    if (!usuario?.id) {
      showSnackbar("Sessão inválida. Faça login novamente.", "error");
      return;
    }
    setFinalizando(true);

    try {
      // 1) Recebimento completo no backend: fecha as comandas (status 1),
      //    registra o funcionário, a data/hora, descontos/acréscimos e o valor final.
      const resp = await receberComandas({
        comandas_ids: selecionadas.map((c) => c.id),
        funcionario_id: usuario.id,
        cliente_id: clienteId ? Number(clienteId) : null,
        desconto_valor: descontoNum || null,
        acrescimo_valor: acrescimoNum || null,
      });

      // 2) Comprovante detalhado gerado pela API (não bloqueia se indisponível).
      let comprovante = null;
      if (resp?.recebimento_id != null) {
        try {
          comprovante = await getComprovante(resp.recebimento_id);
        } catch {
          comprovante = null;
        }
      }

      // 3) Monta a nota usando os valores retornados pelo backend.
      setNota({
        recebimentoId: resp?.recebimento_id ?? null,
        comandas: selecionadas.map((c) => ({ id: c.id, comanda: c.comanda })),
        itens: consolidado,
        subtotal: resp?.subtotal_geral ?? subtotal,
        desconto: resp?.desconto_total ?? descontoNum,
        acrescimo: resp?.acrescimo_total ?? acrescimoNum,
        total: resp?.valor_final ?? totalFinal,
        forma,
        cliente: resp?.cliente ?? clienteSelecionado,
        funcionario: resp?.funcionario ?? null,
        data: resp?.data_hora ? parseApiDate(resp.data_hora) : new Date(),
        comprovante,
      });

      showSnackbar(resp?.mensagem || "Recebimento efetuado e comandas fechadas.", "success");
      limpar();
      carregar();
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Não foi possível efetuar o recebimento."), "error");
    } finally {
      setFinalizando(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="section-eyebrow">operação · caixa</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", margin: "4px 0 0", color: "var(--ink)" }}>
            Caixa
          </h1>
        </div>
      </div>

      <div className="caixa-split">
        {/* Comandas abertas */}
        <div className="card card-pad">
          <div className="section-title">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Receipt size={18} />
              <h2>Comandas Abertas</h2>
              <span className="filters-badge">{comandas.length}</span>
            </div>
            <button className="btn-icon" title="Atualizar" onClick={carregar}>
              <RefreshCw size={15} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Carregando…</div>
          ) : comandas.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
              Nenhuma comanda aberta no momento.
            </div>
          ) : (
            <div className="card-grid-2" style={{ marginTop: 6 }}>
              {comandas.map((c) => {
                const sel = selectedIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    className={"card card-pad-sm comanda-pick" + (sel ? " sel" : "")}
                    onClick={() => toggle(c.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>
                        #{c.comanda}
                      </span>
                      <span className={"chip " + (sel ? "chip-accent" : "chip-good")}>
                        <span className="dot" style={{ width: 6, height: 6, background: sel ? "var(--accent)" : "var(--good)" }} />
                        {sel ? "Selecionada" : "Aberta"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12, color: "var(--ink-2)" }}>
                      <User size={13} style={{ color: "var(--ink-3)" }} />
                      {c.cliente?.nome || "Cliente não identificado"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        {c.itens.length} {c.itens.length === 1 ? "item" : "itens"} · {fmtHora(c.data_hora)}
                      </span>
                      <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--good)" }}>
                        {fmt(c.total)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Conferência */}
        <div className="card card-pad">
          <div className="section-title">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShoppingCart size={18} />
              <h2>Conferência</h2>
            </div>
            {selecionadas.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={limpar}>
                <X size={13} /> Limpar ({selecionadas.length})
              </button>
            )}
          </div>

          {selecionadas.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-3)" }}>
              <ShoppingCart size={36} style={{ opacity: 0.4 }} />
              <div style={{ fontWeight: 600, marginTop: 12, color: "var(--ink-2)" }}>Nenhuma comanda selecionada</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Selecione comandas à esquerda para conferir e cobrar.</div>
            </div>
          ) : (
            <>
              {/* Comandas incluídas */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "6px 0 14px" }}>
                {selecionadas.map((c) => (
                  <span key={c.id} className="chip chip-accent" style={{ cursor: "pointer" }} onClick={() => toggle(c.id)} title="Remover da conferência">
                    Comanda #{c.comanda} <X size={12} />
                  </span>
                ))}
              </div>

              {/* Itens consolidados */}
              <div className="section-eyebrow" style={{ marginBottom: 8 }}>itens consumidos (consolidado)</div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {consolidado.map((i) => {
                  const src = produtoFotoSrc(i.foto);
                  return (
                    <div key={i.key} style={{
                      display: "grid", gridTemplateColumns: "40px 1fr auto", alignItems: "center", gap: 10,
                      padding: "10px 0", borderBottom: "1px solid var(--line)",
                    }}>
                      {src ? (
                        <img src={src} alt={i.nome} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", display: "block" }} />
                      ) : (
                        <div className="hatch" style={{ width: 40, height: 40, fontSize: 8 }}>—</div>
                      )}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{i.nome}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{i.quantidade}× · {fmt(i.valor_unitario)}</div>
                      </div>
                      <div className="mono" style={{ fontSize: 13, fontWeight: 700, textAlign: "right" }}>
                        {fmt(i.quantidade * i.valor_unitario)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Associar cliente */}
              <div className="field" style={{ marginTop: 16 }}>
                <label className="field-label">Associar cliente (opcional)</label>
                <select className="fld" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                  <option value="">Sem cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {/* Desconto / Acréscimo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                <div className="field">
                  <label className="field-label">Desconto (R$)</label>
                  <input className="fld" type="number" min="0" step="0.01" placeholder="0,00"
                    value={desconto} onChange={(e) => setDesconto(e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Acréscimo (R$)</label>
                  <input className="fld" type="number" min="0" step="0.01" placeholder="0,00"
                    value={acrescimo} onChange={(e) => setAcrescimo(e.target.value)} />
                </div>
              </div>

              {/* Forma de pagamento */}
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label">Forma de pagamento</label>
                <select className="fld" value={forma} onChange={(e) => setForma(e.target.value)}>
                  {FORMAS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Totais */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-2)" }}>
                  <span>Subtotal</span>
                  <span className="mono">{fmt(subtotal)}</span>
                </div>
                {descontoNum > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--bad)", marginTop: 4 }}>
                    <span>Desconto</span>
                    <span className="mono">− {fmt(descontoNum)}</span>
                  </div>
                )}
                {acrescimoNum > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
                    <span>Acréscimo</span>
                    <span className="mono">+ {fmt(acrescimoNum)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
                  <span style={{ fontWeight: 600 }}>Total final</span>
                  <span className="mono" style={{ fontSize: 26, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                    {fmt(totalFinal)}
                  </span>
                </div>
              </div>

              <button className="btn btn-accent btn-lg btn-full" style={{ marginTop: 16 }}
                disabled={finalizando} onClick={finalizar}>
                <CheckCircle2 size={16} /> {finalizando ? "Finalizando…" : "Finalizar e gerar nota"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Nota / cupom para impressão */}
      {nota && (
        <div className="nota-overlay" onClick={(e) => { if (e.target === e.currentTarget) setNota(null); }}>
          <div className="nota-print">
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "1px" }}>COMANDAS STUANI</div>
              <div style={{ fontSize: 10 }}>Comprovante de recebimento — não fiscal</div>
            </div>
            <hr className="nota-sep" />
            {nota.recebimentoId != null && (
              <div className="nota-row"><span>Recebimento</span><span>Nº {nota.recebimentoId}</span></div>
            )}
            <div className="nota-row"><span>Data</span><span>{fmtDataHora(nota.data)}</span></div>
            <div className="nota-row">
              <span>{nota.comandas.length > 1 ? "Comandas" : "Comanda"}</span>
              <span>{nota.comandas.map((c) => `#${c.comanda}`).join(", ")}</span>
            </div>
            {nota.cliente && (
              <div className="nota-row"><span>Cliente</span><span>{nota.cliente.nome}</span></div>
            )}
            {nota.funcionario?.nome && (
              <div className="nota-row"><span>Atendente</span><span>{nota.funcionario.nome}</span></div>
            )}
            <hr className="nota-sep" />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span>ITEM</span><span>TOTAL</span>
            </div>
            {nota.itens.map((i) => (
              <div key={i.key} style={{ marginTop: 6 }}>
                <div className="nota-row">
                  <span>{i.nome}</span>
                  <span>{fmt(i.quantidade * i.valor_unitario)}</span>
                </div>
                <div style={{ color: "#555", fontSize: 11 }}>{i.quantidade} x {fmt(i.valor_unitario)}</div>
              </div>
            ))}
            <hr className="nota-sep" />
            <div className="nota-row"><span>Subtotal</span><span>{fmt(nota.subtotal)}</span></div>
            {nota.desconto > 0 && <div className="nota-row"><span>Desconto</span><span>- {fmt(nota.desconto)}</span></div>}
            {nota.acrescimo > 0 && <div className="nota-row"><span>Acréscimo</span><span>+ {fmt(nota.acrescimo)}</span></div>}
            <div className="nota-row" style={{ fontSize: 15, fontWeight: 700, marginTop: 8 }}>
              <span>TOTAL</span><span>{fmt(nota.total)}</span>
            </div>
            <div className="nota-row" style={{ marginTop: 6 }}><span>Pagamento</span><span>{nota.forma}</span></div>
            <hr className="nota-sep" />
            <div style={{ textAlign: "center", fontSize: 11, marginTop: 8 }}>
              Obrigado pela preferência!<br />Volte sempre 🍴
            </div>
          </div>

          <div className="nota-actions no-print">
            <button className="btn btn-ghost btn-full" onClick={() => setNota(null)}>Fechar</button>
            <button className="btn btn-primary btn-full" onClick={() => window.print()}>
              <Printer size={15} /> Imprimir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaixaPage;
