import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { ItemKind, Listing, Order } from "../../types/marketplace";
import { cardStyle, getApiError, inputStyle, pageStyle, StatusBadge } from "./shared";
import TopBar from "./TopBar";

interface ClientDashboardProps {
  mode: "cliente" | "empresa";
}

interface CartQuantity {
  listingId: string;
  value: string;
}

export default function ClientDashboard({ mode }: ClientDashboardProps) {
  const [products, setProducts] = useState<Listing[]>([]);
  const [residues, setResidues] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartQuantity, setCartQuantity] = useState<CartQuantity>({ listingId: "", value: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const title = mode === "empresa" ? "Dashboard Empresa" : "E-commerce ConectaCampo";
  const subtitle = mode === "empresa"
    ? "Solicite resíduos e produtos para uso como matéria-prima sustentável."
    : "Compre produtos e gere demandas para o CRM do admin.";

  const marketplaceItems = useMemo(() => {
    const ordered = mode === "empresa" ? [...residues, ...products] : [...products, ...residues];
    return ordered;
  }, [mode, products, residues]);

  const loadData = async () => {
    const [productsResponse, residuesResponse, ordersResponse] = await Promise.all([
      api.get<Listing[]>("/marketplace/products"),
      api.get<Listing[]>("/marketplace/residues"),
      api.get<Order[]>("/orders/my"),
    ]);

    setProducts(productsResponse.data);
    setResidues(residuesResponse.data);
    setOrders(ordersResponse.data);
  };

  useEffect(() => {
    loadData().catch((loadError) => setError(getApiError(loadError, "Erro ao carregar marketplace")));
  }, []);

  const createOrder = async (item: Listing, itemKind: ItemKind) => {
    const quantity = Number(cartQuantity.listingId === item.id ? cartQuantity.value : 1);
    setError("");
    setMessage("");

    if (Number.isNaN(quantity) || quantity <= 0) {
      setError("Informe uma quantidade válida.");
      return;
    }

    try {
      await api.post("/orders", {
        itemKind,
        itemName: item.name,
        quantity,
        unit: item.unit,
        notes: `Pedido criado pelo ${mode === "empresa" ? "dashboard empresa" : "e-commerce do cliente"}.`,
      });

      setCartQuantity({ listingId: "", value: "" });
      setMessage("Pedido enviado para o CRM do admin. Aguarde a intermediação com o produtor.");
      await loadData();
    } catch (orderError) {
      setError(getApiError(orderError, "Erro ao criar pedido"));
    }
  };

  const kindByItem = (item: Listing): ItemKind => products.some((product) => product.id === item.id) ? "PRODUTO" : "RESIDUO";

  return (
    <div style={pageStyle}>
      <TopBar title={title} subtitle={subtitle} />

      {error && <div className="auth-error" style={{ marginBottom: "16px" }}>{error}</div>}
      {message && <div style={{ ...cardStyle, marginBottom: "16px", borderColor: "var(--accent)", color: "var(--accent)" }}>{message}</div>}

      <section style={{ marginBottom: "28px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "30px" }}>Marketplace</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {marketplaceItems.length === 0 && <div style={cardStyle}>Ainda não existem itens cadastrados por produtores.</div>}
          {marketplaceItems.map((item) => {
            const itemKind = kindByItem(item);
            const producerName = item.producer?.user?.name || "Produtor";

            return (
              <div key={item.id} style={cardStyle}>
                <StatusBadge>{itemKind}</StatusBadge>
                <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>{item.name}</h3>
                <p style={{ color: "var(--text-muted)", margin: "4px 0" }}>{item.category}</p>
                <p style={{ margin: "4px 0" }}>{item.quantity} {item.unit} disponíveis</p>
                <p style={{ margin: "4px 0" }}>R$ {item.price.toFixed(2)} / {item.unit}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Fornecedor: {producerName}</p>
                <input
                  style={inputStyle}
                  type="number"
                  min="1"
                  max={item.quantity}
                  placeholder={`Quantidade em ${item.unit}`}
                  value={cartQuantity.listingId === item.id ? cartQuantity.value : ""}
                  onChange={(event) => setCartQuantity({ listingId: item.id, value: event.target.value })}
                />
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => void createOrder(item, itemKind)}>Solicitar compra</button>
              </div>
            );
          })}
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", marginTop: 0 }}>Meus pedidos</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", fontSize: "12px", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>Item</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Qtd.</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Produtor</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px" }}>{order.itemName}</td>
                  <td style={{ padding: "10px" }}>{order.quantity} {order.unit}</td>
                  <td style={{ padding: "10px" }}><StatusBadge>{order.status}</StatusBadge></td>
                  <td style={{ padding: "10px" }}>{order.assignedProducer?.user?.name || "Aguardando admin"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
