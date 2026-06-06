import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { ItemKind, Listing, Order } from "../../types/marketplace";
import { getApiError, StatusBadge } from "./shared";
import TopBar from "./TopBar";

interface ClientDashboardProps {
  mode: "cliente" | "empresa";
}

interface CartQuantity {
  listingId: string;
  value: string;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .eco-page {
    min-height: 100vh;
    background-color: #f5f0e8;
    background-image:
      radial-gradient(ellipse at 10% 20%, rgba(134,168,89,0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 90% 80%, rgba(193,154,107,0.10) 0%, transparent 50%);
    font-family: 'DM Sans', sans-serif;
    color: #2c2416;
    padding: 0 0 60px;
  }

  .eco-container {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 28px;
  }

  .eco-section-header {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin: 40px 0 20px;
  }

  .eco-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 600;
    color: #2c2416;
    margin: 0;
    line-height: 1.1;
  }

  .eco-section-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #c1a06b44, transparent);
  }

  .eco-section-count {
    font-size: 12px;
    color: #a89878;
    font-weight: 500;
    background: #e8dfc8;
    padding: 3px 10px;
    border-radius: 20px;
  }

  .eco-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
    gap: 20px;
  }

  .eco-card {
    background: #fff;
    border-radius: 16px;
    padding: 22px;
    border: 1px solid rgba(193,160,107,0.18);
    box-shadow: 0 2px 12px rgba(44,36,22,0.06);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
    position: relative;
    overflow: hidden;
  }

  .eco-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #86a859, #c1a06b);
    opacity: 0;
    transition: opacity 0.22s ease;
  }

  .eco-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(44,36,22,0.12);
  }

  .eco-card:hover::before {
    opacity: 1;
  }

  .eco-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    margin-bottom: 12px;
  }

  .eco-badge-produto {
    background: #edf5e4;
    color: #4a7c28;
    border: 1px solid #c2dba8;
  }

  .eco-badge-residuo {
    background: #fdf3e4;
    color: #8a5c1a;
    border: 1px solid #ddc89a;
  }

  .eco-card-name {
    font-family: 'Playfair Display', serif;
    font-size: 19px;
    margin: 0 0 6px;
    color: #2c2416;
    line-height: 1.25;
  }

  .eco-card-category {
    font-size: 12px;
    color: #a89878;
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 500;
  }

  .eco-card-price {
    font-size: 22px;
    font-weight: 500;
    color: #4a7c28;
    margin: 10px 0 4px;
  }

  .eco-card-price span {
    font-size: 13px;
    color: #a89878;
    font-weight: 400;
  }

  .eco-card-stock {
    font-size: 13px;
    color: #7a6a52;
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .eco-card-supplier {
    font-size: 12px;
    color: #a89878;
    margin: 0 0 14px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .eco-divider {
    height: 1px;
    background: #f0e8d8;
    margin: 14px 0;
  }

  .eco-qty-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .eco-input {
    flex: 1;
    padding: 9px 13px;
    border: 1.5px solid #e0d4bc;
    border-radius: 10px;
    background: #faf7f2;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #2c2416;
    transition: border-color 0.18s;
    outline: none;
  }

  .eco-input:focus {
    border-color: #86a859;
    background: #fff;
  }

  .eco-input::placeholder {
    color: #c4b89a;
    font-size: 12px;
  }

  .eco-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 16px;
    background: #2c2416;
    color: #e8dfc8;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.18s, transform 0.12s;
    white-space: nowrap;
  }

  .eco-btn:hover {
    background: #4a7c28;
    transform: scale(1.02);
  }

  .eco-btn:active {
    transform: scale(0.98);
  }

  .eco-btn-full {
    width: 100%;
    margin-top: 10px;
    padding: 12px;
    font-size: 14px;
  }

  /* Empty state */
  .eco-empty {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    background: #fff;
    border-radius: 20px;
    border: 1.5px dashed #d8ccb4;
    text-align: center;
  }

  .eco-empty-illustration {
    margin-bottom: 24px;
    opacity: 0.85;
  }

  .eco-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #2c2416;
    margin: 0 0 10px;
  }

  .eco-empty-text {
    font-size: 14px;
    color: #a89878;
    max-width: 340px;
    line-height: 1.6;
    margin: 0 0 20px;
  }

  .eco-empty-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 22px;
    background: #86a859;
    color: #fff;
    border: none;
    border-radius: 30px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.18s;
    text-decoration: none;
  }

  .eco-empty-cta:hover {
    background: #4a7c28;
  }

  /* Orders table */
  .eco-orders-section {
    background: #fff;
    border-radius: 20px;
    border: 1px solid rgba(193,160,107,0.18);
    padding: 28px;
    box-shadow: 0 2px 12px rgba(44,36,22,0.05);
    margin-top: 16px;
  }

  .eco-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }

  .eco-table th {
    padding: 10px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #a89878;
    border-bottom: 1.5px solid #f0e8d8;
  }

  .eco-table td {
    padding: 13px 14px;
    font-size: 14px;
    border-bottom: 1px solid #f7f2ea;
    color: #2c2416;
    vertical-align: middle;
  }

  .eco-table tr:last-child td {
    border-bottom: none;
  }

  .eco-table tr:hover td {
    background: #faf7f2;
  }

  .eco-orders-empty {
    text-align: center;
    padding: 40px;
    color: #a89878;
    font-size: 14px;
  }

  /* Alerts */
  .eco-alert-error {
    background: #fff5f5;
    border: 1px solid #f5c6c6;
    color: #b84040;
    border-radius: 12px;
    padding: 13px 18px;
    font-size: 14px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .eco-alert-success {
    background: #f2f8ed;
    border: 1px solid #b8d89a;
    color: #3d6e1a;
    border-radius: 12px;
    padding: 13px 18px;
    font-size: 14px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Order status badges */
  .eco-status {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.6px;
    text-transform: uppercase;
  }

`;

// Inline SVG illustration of a farmer
function FarmerIllustration() {
  return (
    <svg
      className="eco-empty-illustration"
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <ellipse cx="90" cy="158" rx="62" ry="10" fill="#e8dfc8" />
      {/* Body */}
      <rect x="68" y="100" width="44" height="52" rx="8" fill="#86a859" />
      {/* Legs */}
      <rect x="72" y="142" width="14" height="22" rx="5" fill="#5a3e28" />
      <rect x="94" y="142" width="14" height="22" rx="5" fill="#5a3e28" />
      {/* Shoes */}
      <ellipse cx="79" cy="163" rx="9" ry="5" fill="#3a2810" />
      <ellipse cx="101" cy="163" rx="9" ry="5" fill="#3a2810" />
      {/* Head */}
      <circle cx="90" cy="80" r="22" fill="#f5d0a0" />
      {/* Hat brim */}
      <ellipse cx="90" cy="62" rx="28" ry="6" fill="#c1a06b" />
      {/* Hat top */}
      <rect x="72" y="40" width="36" height="24" rx="4" fill="#c1a06b" />
      {/* Hat band */}
      <rect x="72" y="58" width="36" height="5" rx="2" fill="#a07840" />
      {/* Eyes */}
      <circle cx="83" cy="80" r="3" fill="#3a2810" />
      <circle cx="97" cy="80" r="3" fill="#3a2810" />
      {/* Smile */}
      <path d="M83 90 Q90 97 97 90" stroke="#3a2810" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Left arm with basket */}
      <rect x="44" y="104" width="26" height="10" rx="5" fill="#86a859" />
      {/* Basket */}
      <rect x="24" y="108" width="28" height="22" rx="5" fill="#c1a06b" />
      <path d="M24 116 Q38 110 52 116" stroke="#a07840" strokeWidth="1.5" fill="none" />
      {/* Basket weave lines */}
      <line x1="32" y1="116" x2="32" y2="130" stroke="#a07840" strokeWidth="1" />
      <line x1="40" y1="116" x2="40" y2="130" stroke="#a07840" strokeWidth="1" />
      <line x1="44" y1="116" x2="44" y2="130" stroke="#a07840" strokeWidth="1" />
      {/* Veggies in basket */}
      <circle cx="33" cy="113" r="5" fill="#4a7c28" />
      <circle cx="42" cy="112" r="4" fill="#e05c2a" />
      <circle cx="38" cy="114" r="3" fill="#f0c040" />
      {/* Right arm */}
      <rect x="110" y="104" width="24" height="10" rx="5" fill="#86a859" />
      {/* Plant/sprout in right hand */}
      <line x1="134" y1="109" x2="134" y2="85" stroke="#4a7c28" strokeWidth="2.5" />
      <ellipse cx="127" cy="92" rx="9" ry="5" fill="#86a859" transform="rotate(-30 127 92)" />
      <ellipse cx="141" cy="88" rx="9" ry="5" fill="#86a859" transform="rotate(30 141 88)" />
    </svg>
  );
}

function getStatusStyle(status: string): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    PENDENTE: { bg: "#fdf3e4", color: "#8a5c1a" },
    CONFIRMADO: { bg: "#edf5e4", color: "#4a7c28" },
    ENTREGUE: { bg: "#e4eff5", color: "#1a5c8a" },
    CANCELADO: { bg: "#fde8e8", color: "#8a1a1a" },
  };
  const s = map[status] ?? { bg: "#f0ece4", color: "#7a6a52" };
  return { background: s.bg, color: s.color };
}

export default function ClientDashboard({ mode }: ClientDashboardProps) {
  const [products, setProducts] = useState<Listing[]>([]);
  const [residues, setResidues] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartQuantity, setCartQuantity] = useState<CartQuantity>({ listingId: "", value: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const title = mode === "empresa" ? "Dashboard Empresa" : "ConectaCampo";
  const subtitle = mode === "empresa"
    ? "Solicite resíduos e produtos para uso como matéria-prima sustentável."
    : "Produtos orgânicos e saudáveis direto do produtor para a sua mesa.";

  const marketplaceItems = useMemo(() => {
    return mode === "empresa" ? [...residues, ...products] : [...products, ...residues];
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

  const kindByItem = (item: Listing): ItemKind =>
    products.some((p) => p.id === item.id) ? "PRODUTO" : "RESIDUO";

  return (
    <>
      <style>{styles}</style>
      <div className="eco-page">
        <TopBar title={title} subtitle={subtitle} />

        <div className="eco-container">
          {/* Alerts */}
          {error && (
            <div className="eco-alert-error" style={{ marginTop: "24px" }}>
              <span>⚠️</span> {error}
            </div>
          )}
          {message && (
            <div className="eco-alert-success" style={{ marginTop: "24px" }}>
              <span>✅</span> {message}
            </div>
          )}

          {/* Marketplace */}
          <div className="eco-section-header">
            <h2 className="eco-section-title">Marketplace</h2>
            <div className="eco-section-line" />
            {marketplaceItems.length > 0 && (
              <span className="eco-section-count">{marketplaceItems.length} itens</span>
            )}
          </div>

          <div className="eco-grid">
            {marketplaceItems.length === 0 ? (
              <div className="eco-empty">
                <FarmerIllustration />
                <h3 className="eco-empty-title">Nenhum produto na sua região</h3>
                <p className="eco-empty-text">
                  Por enquanto não temos produtos disponíveis perto de você. Entre em contato e
                  faremos o possível para levar o campo até a sua mesa.
                </p>
                <a href="mailto:contato@conectacampo.com.br" className="eco-empty-cta">
                  ✉️ &nbsp;Fale conosco
                </a>
              </div>
            ) : (
              marketplaceItems.map((item) => {
                const itemKind = kindByItem(item);
                const producerName = item.producer?.user?.name || "Produtor";
                const isProduto = itemKind === "PRODUTO";

                return (
                  <div key={item.id} className="eco-card">
                    <span className={`eco-badge ${isProduto ? "eco-badge-produto" : "eco-badge-residuo"}`}>
                      {isProduto ? "🌾" : "♻️"} {itemKind}
                    </span>
                    <h3 className="eco-card-name">{item.name}</h3>
                    <p className="eco-card-category">{item.category}</p>
                    <p className="eco-card-price">
                      R$ {item.price.toFixed(2)} <span>/ {item.unit}</span>
                    </p>
                    <p className="eco-card-stock">
                      📦 {item.quantity} {item.unit} disponíveis
                    </p>
                    <p className="eco-card-supplier">
                      🧑‍🌾 {producerName}
                    </p>
                    <div className="eco-divider" />
                    <div className="eco-qty-row">
                      <input
                        className="eco-input"
                        type="number"
                        min="1"
                        max={item.quantity}
                        placeholder={`Qtd. em ${item.unit}`}
                        value={cartQuantity.listingId === item.id ? cartQuantity.value : ""}
                        onChange={(e) => setCartQuantity({ listingId: item.id, value: e.target.value })}
                      />
                      <button
                        className="eco-btn"
                        onClick={() => void createOrder(item, itemKind)}
                      >
                        Pedir
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Orders */}
          <div className="eco-section-header" style={{ marginTop: "48px" }}>
            <h2 className="eco-section-title">Meus pedidos</h2>
            <div className="eco-section-line" />
            {orders.length > 0 && (
              <span className="eco-section-count">{orders.length} pedidos</span>
            )}
          </div>

          <div className="eco-orders-section">
            {orders.length === 0 ? (
              <p className="eco-orders-empty">🛒 Você ainda não fez nenhum pedido.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="eco-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantidade</th>
                      <th>Status</th>
                      <th>Produtor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 500 }}>{order.itemName}</td>
                        <td>{order.quantity} {order.unit}</td>
                        <td>
                          <span
                            className="eco-status"
                            style={getStatusStyle(order.status)}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td style={{ color: "#7a6a52" }}>
                          {order.assignedProducer?.user?.name || "Aguardando admin"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}