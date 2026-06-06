import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { MatchResult, Order } from "../../types/marketplace";
import { cardStyle, getApiError, pageStyle, StatusBadge } from "./shared";
import TopBar from "./TopBar";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totals = useMemo(() => ({
    pendentes: orders.filter((order) => order.status === "PENDENTE").length,
    processando: orders.filter((order) => order.status === "PROCESSANDO").length,
    concluidos: orders.filter((order) => order.status === "CONCLUIDO").length,
  }), [orders]);

  const loadOrders = async () => {
    const response = await api.get<Order[]>("/admin/orders");
    setOrders(response.data);
  };

  useEffect(() => {
    loadOrders().catch((loadError: unknown) => setError(getApiError(loadError, "Erro ao carregar pedidos")));
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

  return (
    <div style={pageStyle}>
      <TopBar title="CRM ConectaCampo" subtitle="Controle as demandas, encontre produtores e acompanhe o status de cada pedido." />

      {error && <div className="auth-error" style={{ marginBottom: "16px" }}>{error}</div>}
      {message && <div style={{ ...cardStyle, marginBottom: "16px", borderColor: "var(--accent)", color: "var(--accent)" }}>{message}</div>}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={cardStyle}><strong>Pendentes</strong><p style={{ fontSize: "32px", margin: "8px 0 0" }}>{totals.pendentes}</p></div>
        <div style={cardStyle}><strong>Processando</strong><p style={{ fontSize: "32px", margin: "8px 0 0" }}>{totals.processando}</p></div>
        <div style={cardStyle}><strong>Concluídos</strong><p style={{ fontSize: "32px", margin: "8px 0 0" }}>{totals.concluidos}</p></div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: selectedOrder ? "minmax(0, 1fr) 380px" : "1fr", gap: "20px", alignItems: "start" }}>
        <section style={cardStyle}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", marginTop: 0 }}>Demandas dos clientes e empresas</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "var(--text-muted)", fontSize: "12px", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "12px", textAlign: "left" }}>Solicitante</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Tipo</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Item</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Qtd.</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px" }}>{order.requester?.name || "Cliente"}</td>
                    <td style={{ padding: "12px" }}>{order.itemKind}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{order.itemName}</td>
                    <td style={{ padding: "12px" }}>{order.quantity} {order.unit}</td>
                    <td style={{ padding: "12px" }}><StatusBadge>{order.status}</StatusBadge></td>
                    <td style={{ padding: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button className="btn-primary" style={{ padding: "8px 12px" }} onClick={() => void openOrder(order)}>Abrir</button>
                      {order.status === "PROCESSANDO" && <button className="btn-ghost" style={{ padding: "8px 12px" }} disabled={loading} onClick={() => void completeOrder(order.id)}>Entregue</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedOrder && (
          <aside style={{ ...cardStyle, position: "sticky", top: "24px" }}>
            <button className="btn-ghost" style={{ marginBottom: "12px" }} onClick={() => setSelectedOrder(null)}>Fechar</button>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", margin: "0 0 8px" }}>{selectedOrder.itemName}</h2>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>Pedido de {selectedOrder.quantity} {selectedOrder.unit}. Selecione um produtor compatível para enviar a solicitação.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {matches.length === 0 && <p style={{ color: "var(--text-muted)" }}>Nenhum produtor com estoque suficiente foi encontrado.</p>}
              {matches.map((match) => (
                <div key={match.listingId} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <strong>{match.producerName}</strong>
                  <p style={{ color: "var(--text-muted)", margin: "4px 0" }}>{match.name} • {match.quantity} {match.unit} disponíveis</p>
                  <p style={{ margin: "4px 0" }}>R$ {match.price.toFixed(2)} / {match.unit}</p>
                  <button className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: "8px" }} onClick={() => void sendSolicitation(match)}>Enviar solicitação</button>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
