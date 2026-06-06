import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { MatchResult, Order } from "../../types/marketplace";
import { getApiError, StatusBadge } from "./shared";
import TopBar from "./TopBar";
import logoConectaCampo from "../../assets/logo.png";

/* ------------------------------------------------------------------ */
/* Paleta / design tokens locais — dashboard premium                   */
/* ------------------------------------------------------------------ */

const C = {
  bg: "var(--bg, #f4f5f1)",
  surface: "var(--surface, #ffffff)",
  border: "var(--border, #e7e8e2)",
  text: "var(--text, #1b1f17)",
  muted: "var(--text-muted, #8b8f84)",
  accent: "var(--accent, #4f6a3f)",
  accentSoft: "var(--accent-soft, rgba(79,106,63,0.10))",
  up: "var(--success, #3f8a4f)",
  down: "var(--danger, #c75c5c)",
  warning: "var(--warning, #c2890a)",
  info: "var(--info, #3f6aa3)",
};

const page: React.CSSProperties = {
  maxWidth: "1320px",
  margin: "0 auto",
  padding: "28px 28px 64px",
  color: C.text,
};

const card: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: "20px",
  boxShadow: "0 1px 2px rgba(20,28,16,0.03), 0 18px 40px -32px rgba(20,28,16,0.45)",
};

const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: C.muted,
  margin: 0,
};

const cardTitle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "17px",
  fontWeight: 700,
  letterSpacing: "-0.01em",
  margin: 0,
};

const brandHero: React.CSSProperties = {
  ...card,
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "24px",
  padding: "26px 30px",
  marginBottom: "22px",
  background:
    "linear-gradient(135deg, rgba(31, 72, 40, 0.96), rgba(79, 106, 63, 0.88)), radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 34%)",
  color: "#fff",
};

const brandInfo: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
};

const logoBox: React.CSSProperties = {
  width: "92px",
  height: "92px",
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  borderRadius: "24px",
  background: "rgba(255, 255, 255, 0.92)",
  boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)",
};

const logoImg: React.CSSProperties = {
  width: "76px",
  height: "76px",
  objectFit: "contain",
};

const brandTitle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "34px",
  lineHeight: 1,
  fontWeight: 700,
  margin: "0 0 8px",
  letterSpacing: "-0.03em",
};

const brandSubtitle: React.CSSProperties = {
  maxWidth: "560px",
  margin: 0,
  color: "rgba(255,255,255,0.78)",
  fontSize: "14px",
  lineHeight: 1.6,
};

const brandBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "9px 13px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.20)",
  color: "rgba(255,255,255,0.84)",
  fontSize: "12px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

/* ------------------------------------------------------------------ */
/* Subcomponentes de UI                                                */
/* ------------------------------------------------------------------ */

function DeltaChip({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "12px",
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: "999px",
        color: positive ? C.up : C.down,
        background: positive ? "rgba(63,138,79,0.10)" : "rgba(199,92,92,0.10)",
      }}
    >
      <span aria-hidden>{positive ? "▲" : "▼"}</span>
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function StatCard({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: string | number;
  delta: number;
  accent: string;
}) {
  return (
    <div style={{ ...card, padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={eyebrow}>{label}</p>
        <span
          aria-hidden
          style={{ width: "8px", height: "8px", borderRadius: "999px", background: accent }}
        />
      </div>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "34px",
          lineHeight: 1,
          margin: 0,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <DeltaChip value={delta} />
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;
  return (
    <div style={{ position: "relative", width: "140px", height: "140px" }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke={C.border} strokeWidth="14" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={C.accent}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700 }}>
          {Math.round(pct)}%
        </span>
        <span style={{ fontSize: "11px", color: C.muted, fontWeight: 600 }}>concluído</span>
      </div>
    </div>
  );
}

function Banner({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  const isError = tone === "error";
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 18px",
        marginBottom: "20px",
        borderRadius: "14px",
        border: `1px solid ${isError ? C.down : C.accent}`,
        background: isError ? "rgba(199,92,92,0.06)" : "rgba(79,106,63,0.06)",
        color: isError ? C.down : C.accent,
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      <span
        aria-hidden
        style={{ flexShrink: 0, width: "8px", height: "8px", borderRadius: "999px", background: "currentColor" }}
      />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totals = useMemo(
    () => ({
      total: orders.length,
      pendentes: orders.filter((order) => order.status === "PENDENTE").length,
      processando: orders.filter((order) => order.status === "PROCESSANDO").length,
      concluidos: orders.filter((order) => order.status === "CONCLUIDO").length,
    }),
    [orders],
  );

  const completionPct = totals.total > 0 ? (totals.concluidos / totals.total) * 100 : 0;

  const statusBars = useMemo(
    () => [
      { label: "Pendente", value: totals.pendentes, color: C.warning },
      { label: "Processando", value: totals.processando, color: C.info },
      { label: "Concluído", value: totals.concluidos, color: C.accent },
    ],
    [totals],
  );

  const maxBar = Math.max(1, ...statusBars.map((bar) => bar.value));

  const loadOrders = async () => {
    const response = await api.get<Order[]>("/admin/orders");
    setOrders(response.data);
  };

  useEffect(() => {
    loadOrders().catch((loadError: unknown) =>
      setError(getApiError(loadError, "Erro ao carregar pedidos")),
    );
  }, []);

  const openOrder = async (order: Order) => {
    setSelectedOrder(order);
    setMatches([]);
    setError("");
    setMessage("");

    try {
      const response = await api.get<MatchResult[]>(`/admin/orders/${order.id}/matches`);
      setMatches(response.data);
    } catch (matchError) {
      setError(getApiError(matchError, "Erro ao buscar produtores compatíveis"));
    }
  };

  const sendSolicitation = async (match: MatchResult) => {
    if (!selectedOrder) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post(`/admin/orders/${selectedOrder.id}/solicitations`, {
        producerId: match.producerId,
        itemKind: match.itemKind,
        listingId: match.listingId,
        message: `Olá! A ConectaCampo recebeu uma demanda de ${selectedOrder.quantity} ${selectedOrder.unit} de ${selectedOrder.itemName}. Você confirma disponibilidade?`,
      });

      setMessage("Solicitação enviada ao produtor. O pedido continuará pendente até ele aceitar.");
      await loadOrders();
    } catch (sendError) {
      setError(getApiError(sendError, "Erro ao enviar solicitação"));
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async (orderId: string) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.patch(`/admin/orders/${orderId}/complete`);
      setMessage("Pedido marcado como entregue e concluído.");
      await loadOrders();
      setSelectedOrder(null);
    } catch (completeError) {
      setError(getApiError(completeError, "Erro ao concluir pedido"));
    } finally {
      setLoading(false);
    }
  };

  const th: React.CSSProperties = {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: C.muted,
    whiteSpace: "nowrap",
  };

  const td: React.CSSProperties = {
    padding: "16px",
    fontSize: "14px",
    verticalAlign: "middle",
  };

  return (
    <div style={page}>
      <TopBar
        title="CRM ConectaCampo"
        subtitle="Controle as demandas, encontre produtores e acompanhe o status de cada pedido."
      />

      {error && <Banner tone="error">{error}</Banner>}
      {message && <Banner tone="success">{message}</Banner>}
      <section style={brandHero}>
      <div style={brandInfo}>
        <div style={logoBox}>
          <img src={logoConectaCampo} alt="Logo ConectaCampo" style={logoImg} />
        </div>

        <div>
          <p
            style={{
              ...eyebrow,
              color: "rgba(255,255,255,0.68)",
              marginBottom: "8px",
            }}
          >
            Painel administrativo
          </p>

          <h1 style={brandTitle}>ConectaCampo</h1>

          <p style={brandSubtitle}>
            Central de controle para acompanhar demandas, localizar produtores compatíveis
            e transformar excedentes do campo em novas oportunidades de negócio.
          </p>
        </div>
      </div>

      <div style={brandBadge}>
        <span
          aria-hidden
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: "#7CFF8A",
            boxShadow: "0 0 14px rgba(124,255,138,0.85)",
          }}
        />
        Sistema ativo
      </div>
    </section>
      {/* Linha de indicadores */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <StatCard label="Total de demandas" value={totals.total} delta={8.2} accent={C.accent} />
        <StatCard label="Pendentes" value={totals.pendentes} delta={-3.1} accent={C.warning} />
        <StatCard label="Processando" value={totals.processando} delta={5.4} accent={C.info} />
        <StatCard label="Concluídos" value={totals.concluidos} delta={12.7} accent={C.up} />
      </section>

      {/* Linha de gráficos */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Gráfico de barras por status */}
        <div style={{ ...card, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <p style={eyebrow}>Distribuição</p>
              <h2 style={{ ...cardTitle, marginTop: "6px" }}>Demandas por status</h2>
            </div>
            <span style={{ fontSize: "12px", color: C.muted, fontWeight: 600 }}>{totals.total} no total</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: "28px", height: "180px", paddingLeft: "4px" }}>
            {statusBars.map((bar) => (
              <div
                key={bar.label}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", height: "100%", justifyContent: "flex-end" }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700 }}>{bar.value}</span>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "72px",
                    height: `${(bar.value / maxBar) * 120 + 8}px`,
                    background: bar.color,
                    borderRadius: "10px 10px 4px 4px",
                    transition: "height 0.3s ease",
                  }}
                />
                <span style={{ fontSize: "12px", color: C.muted, fontWeight: 600 }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Taxa de conclusão */}
        <div style={{ ...card, padding: "22px 24px", display: "flex", flexDirection: "column" }}>
          <div>
            <p style={eyebrow}>Performance</p>
            <h2 style={{ ...cardTitle, marginTop: "6px" }}>Taxa de conclusão</h2>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", paddingTop: "12px" }}>
            <ProgressRing pct={completionPct} />
            <p style={{ fontSize: "13px", color: C.muted, textAlign: "center", margin: 0, lineHeight: 1.5 }}>
              {totals.concluidos} de {totals.total} demandas entregues com sucesso.
            </p>
          </div>
        </div>
      </section>

      {/* Linha de tabela + painel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedOrder ? "minmax(0, 1fr) 400px" : "1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Tabela de demandas */}
        <section style={{ ...card, overflow: "hidden" }}>
          <header
            style={{
              padding: "22px 24px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <p style={eyebrow}>Pipeline</p>
            <h2 style={{ ...cardTitle, fontSize: "19px" }}>Demandas de clientes e empresas</h2>
          </header>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(20,28,16,0.02)" }}>
                  <th style={th}>Solicitante</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Item</th>
                  <th style={th}>Qtd.</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: "right" }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...td, textAlign: "center", color: C.muted, padding: "48px 16px" }}>
                      Nenhuma demanda registrada até o momento.
                    </td>
                  </tr>
                )}
                {orders.map((order) => {
                  const isActive = selectedOrder?.id === order.id;
                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderTop: `1px solid ${C.border}`,
                        background: isActive ? C.accentSoft : "transparent",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td style={{ ...td, fontWeight: 600 }}>{order.requester?.name || "Cliente"}</td>
                      <td style={{ ...td, color: C.muted }}>{order.itemKind}</td>
                      <td style={{ ...td, fontWeight: 700 }}>{order.itemName}</td>
                      <td style={td}>
                        {order.quantity} <span style={{ color: C.muted }}>{order.unit}</span>
                      </td>
                      <td style={td}>
                        <StatusBadge>{order.status}</StatusBadge>
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <button
                            className="btn-primary"
                            style={{ padding: "8px 16px", fontSize: "13px" }}
                            onClick={() => void openOrder(order)}
                          >
                            Abrir
                          </button>
                          {order.status === "PROCESSANDO" && (
                            <button
                              className="btn-ghost"
                              style={{ padding: "8px 16px", fontSize: "13px" }}
                              disabled={loading}
                              onClick={() => void completeOrder(order.id)}
                            >
                              Marcar entregue
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
        </section>

        {/* Painel lateral de produtores compatíveis */}
        {selectedOrder && (
          <aside style={{ ...card, position: "sticky", top: "24px", overflow: "hidden" }}>
            <header
              style={{
                padding: "20px 22px",
                borderBottom: `1px solid ${C.border}`,
                background: "rgba(20,28,16,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div>
                  <p style={eyebrow}>Match de produtores</p>
                  <h2 style={{ ...cardTitle, fontSize: "20px", marginTop: "6px" }}>{selectedOrder.itemName}</h2>
                </div>
                <button
                  className="btn-ghost"
                  style={{ padding: "6px 12px", fontSize: "13px" }}
                  onClick={() => setSelectedOrder(null)}
                >
                  Fechar
                </button>
              </div>
              <p style={{ color: C.muted, margin: "10px 0 0", fontSize: "13px", lineHeight: 1.5 }}>
                Pedido de{" "}
                <strong style={{ color: C.text }}>
                  {selectedOrder.quantity} {selectedOrder.unit}
                </strong>
                . Selecione um produtor compatível para enviar a solicitação.
              </p>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 20px" }}>
              {matches.length === 0 && (
                <p style={{ color: C.muted, fontSize: "14px", textAlign: "center", padding: "24px 0", margin: 0 }}>
                  Nenhum produtor com estoque suficiente foi encontrado.
                </p>
              )}
              {matches.map((match) => (
                <div
                  key={match.listingId}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: "14px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    background: C.surface,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <strong style={{ fontSize: "15px" }}>{match.producerName}</strong>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "15px",
                        color: C.accent,
                        whiteSpace: "nowrap",
                      }}
                    >
                      R$ {match.price.toFixed(2)}
                      <span style={{ fontSize: "12px", color: C.muted, fontWeight: 500 }}> / {match.unit}</span>
                    </span>
                  </div>
                  <p style={{ color: C.muted, margin: 0, fontSize: "13px" }}>
                    {match.name} • {match.quantity} {match.unit} disponíveis
                  </p>
                  <button
                    className="btn-primary"
                    disabled={loading}
                    style={{ width: "100%", justifyContent: "center", marginTop: "2px" }}
                    onClick={() => void sendSolicitation(match)}
                  >
                    Enviar solicitação
                  </button>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
