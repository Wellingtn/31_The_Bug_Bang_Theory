import { useEffect, useState } from "react";
import api from "../../services/api";
import type { Listing, Solicitation } from "../../types/marketplace";
import { cardStyle, getApiError, inputStyle, pageStyle, StatusBadge } from "./shared";
import TopBar from "./TopBar";

type FormState = {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  price: string;
};

const emptyForm: FormState = { name: "", category: "", quantity: "", unit: "kg", price: "" };

export default function ProducerDashboard() {
  const [products, setProducts] = useState<Listing[]>([]);
  const [residues, setResidues] = useState<Listing[]>([]);
  const [solicitations, setSolicitations] = useState<Solicitation[]>([]);
  const [productForm, setProductForm] = useState<FormState>(emptyForm);
  const [residueForm, setResidueForm] = useState<FormState>({ ...emptyForm, unit: "ton" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [productsResponse, residuesResponse, solicitationsResponse] = await Promise.all([
      api.get<Listing[]>("/producer/products"),
      api.get<Listing[]>("/producer/residues"),
      api.get<Solicitation[]>("/producer/solicitations"),
    ]);

    setProducts(productsResponse.data);
    setResidues(residuesResponse.data);
    setSolicitations(solicitationsResponse.data);
  };

  useEffect(() => {
    loadData().catch((loadError) => setError(getApiError(loadError, "Erro ao carregar dados do produtor")));
  }, []);

  const saveListing = async (type: "product" | "residue") => {
    const form = type === "product" ? productForm : residueForm;
    setError("");
    setMessage("");

    try {
      await api.post(type === "product" ? "/producer/products" : "/producer/residues", {
        name: form.name,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        price: Number(form.price),
      });

      if (type === "product") setProductForm(emptyForm);
      if (type === "residue") setResidueForm({ ...emptyForm, unit: "ton" });
      setMessage(type === "product" ? "Produto cadastrado com sucesso." : "Resíduo cadastrado com sucesso.");
      await loadData();
    } catch (saveError) {
      setError(getApiError(saveError, "Erro ao salvar item"));
    }
  };

  const respond = async (solicitationId: string, status: "ACEITA" | "RECUSADA") => {
    setError("");
    setMessage("");

    try {
      await api.patch(`/producer/solicitations/${solicitationId}/respond`, { status });
      setMessage(status === "ACEITA" ? "Solicitação aceita. Seu estoque foi atualizado." : "Solicitação recusada.");
      await loadData();
    } catch (respondError) {
      setError(getApiError(respondError, "Erro ao responder solicitação"));
    }
  };

  return (
    <div style={pageStyle}>
      <TopBar title="Dashboard do Produtor" subtitle="Cadastre produtos, resíduos e responda às solicitações enviadas pelo admin." />

      {error && <div className="auth-error" style={{ marginBottom: "16px" }}>{error}</div>}
      {message && <div style={{ ...cardStyle, marginBottom: "16px", borderColor: "var(--accent)", color: "var(--accent)" }}>{message}</div>}

      <section style={{ ...cardStyle, marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", marginTop: 0 }}>Solicitações recebidas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {solicitations.length === 0 && <p style={{ color: "var(--text-muted)" }}>Nenhuma solicitação recebida ainda.</p>}
          {solicitations.map((solicitation) => (
            <div key={solicitation.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "16px" }}>
              <StatusBadge>{solicitation.status}</StatusBadge>
              <h3 style={{ marginBottom: "6px" }}>{solicitation.order.itemName}</h3>
              <p style={{ color: "var(--text-muted)" }}>{solicitation.quantity} {solicitation.order.unit} solicitados por {solicitation.order.requester?.name || "comprador"}</p>
              {solicitation.message && <p>{solicitation.message}</p>}
              {solicitation.status === "ENVIADA" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-primary" onClick={() => void respond(solicitation.id, "ACEITA")}>Aceitar</button>
                  <button className="btn-ghost" onClick={() => void respond(solicitation.id, "RECUSADA")}>Recusar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <FormCard title="Cadastrar produto perecível" form={productForm} setForm={setProductForm} onSave={() => void saveListing("product")} />
        <FormCard title="Cadastrar resíduo" form={residueForm} setForm={setResidueForm} onSave={() => void saveListing("residue")} />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        <ListingTable title="Produtos cadastrados" items={products} />
        <ListingTable title="Resíduos cadastrados" items={residues} />
      </section>
    </div>
  );
}

function FormCard({ title, form, setForm, onSave }: { title: string; form: FormState; setForm: (form: FormState) => void; onSave: () => void }) {
  return (
    <div style={cardStyle}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", marginTop: 0 }}>{title}</h2>
      <input style={inputStyle} placeholder="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <input style={inputStyle} placeholder="Categoria" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
      <input style={inputStyle} placeholder="Quantidade" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
      <input style={inputStyle} placeholder="Unidade: kg, ton, L" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
      <input style={inputStyle} placeholder="Preço" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
      <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onSave}>Salvar</button>
    </div>
  );
}

function ListingTable({ title, items }: { title: string; items: Listing[] }) {
  return (
    <div style={cardStyle}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", marginTop: 0 }}>{title}</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "var(--text-muted)", fontSize: "12px", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Nome</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Qtd.</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Preço</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px" }}>{item.name}</td>
                <td style={{ padding: "10px" }}>{item.quantity} {item.unit}</td>
                <td style={{ padding: "10px" }}>R$ {item.price.toFixed(2)}</td>
                <td style={{ padding: "10px" }}><StatusBadge>{item.status}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
