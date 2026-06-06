import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { Listing, Solicitation } from "../../types/marketplace";
import { getApiError, StatusBadge } from "./shared";
import TopBar from "./TopBar";

type FormState = {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  price: string;
};

const emptyForm: FormState = {
  name: "",
  category: "",
  quantity: "",
  unit: "kg",
  price: "",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

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
    loadData().catch((loadError) =>
      setError(getApiError(loadError, "Erro ao carregar dados do produtor"))
    );
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

      setMessage(
        type === "product"
          ? "Produto cadastrado com sucesso."
          : "Resíduo cadastrado com sucesso."
      );

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

      setMessage(
        status === "ACEITA"
          ? "Solicitação aceita. Seu estoque foi atualizado."
          : "Solicitação recusada."
      );

      await loadData();
    } catch (respondError) {
      setError(getApiError(respondError, "Erro ao responder solicitação"));
    }
  };

  const pendingSolicitations = useMemo(
    () => solicitations.filter((item) => item.status === "ENVIADA").length,
    [solicitations]
  );

  const productsValue = useMemo(
    () =>
      products.reduce(
        (total, item) => total + Number(item.quantity || 0) * Number(item.price || 0),
        0
      ),
    [products]
  );

  const residuesValue = useMemo(
    () =>
      residues.reduce(
        (total, item) => total + Number(item.quantity || 0) * Number(item.price || 0),
        0
      ),
    [residues]
  );

  return (
    <div className="producer-page">
      <TopBar
        title="Dashboard do Produtor"
        subtitle="Cadastre produtos, resíduos e responda às solicitações enviadas pelo admin."
      />

      <main className="producer-shell">
        <section className="producer-hero">
          <div>
            <span className="producer-kicker">Painel ConectaCampo</span>
            <h1>Gestão inteligente da sua produção rural</h1>
            <p>
              Organize produtos, acompanhe resíduos disponíveis e responda compradores em um só lugar.
            </p>
          </div>

          <div className="producer-hero-card">
            <span>Valor estimado em estoque</span>
            <strong>{formatCurrency(productsValue + residuesValue)}</strong>
            <small>Produtos e resíduos cadastrados</small>
          </div>
        </section>

        {error && <div className="auth-error producer-alert">{error}</div>}

        {message && (
          <div className="producer-success">
            <span>✓</span>
            <p>{message}</p>
          </div>
        )}

        <section className="producer-stats-grid">
          <StatCard
            icon="🌾"
            label="Produtos ativos"
            value={products.length}
            description="Itens perecíveis cadastrados"
          />

          <StatCard
            icon="♻️"
            label="Resíduos disponíveis"
            value={residues.length}
            description="Materiais para reaproveitamento"
          />

          <StatCard
            icon="📩"
            label="Solicitações pendentes"
            value={pendingSolicitations}
            description="Pedidos aguardando resposta"
          />
        </section>

        <section className="producer-section">
          <div className="producer-section-heading">
            <div>
              <span>Negociações</span>
              <h2>Solicitações recebidas</h2>
            </div>
            <p>Analise os pedidos enviados e aceite apenas o que conseguir atender.</p>
          </div>

          {solicitations.length === 0 ? (
            <EmptyState
              icon="📭"
              title="Nenhuma solicitação recebida ainda"
              text="Quando um comprador ou admin enviar uma solicitação, ela aparecerá aqui."
            />
          ) : (
            <div className="producer-request-grid">
              {solicitations.map((solicitation) => (
                <article key={solicitation.id} className="producer-request-card">
                  <div className="producer-request-top">
                    <StatusBadge>{solicitation.status}</StatusBadge>
                    <span className="producer-request-unit">
                      {solicitation.quantity} {solicitation.order.unit}
                    </span>
                  </div>

                  <h3>{solicitation.order.itemName}</h3>

                  <p className="producer-request-meta">
                    Solicitado por{" "}
                    <strong>{solicitation.order.requester?.name || "comprador"}</strong>
                  </p>

                  {solicitation.message && (
                    <p className="producer-request-message">“{solicitation.message}”</p>
                  )}

                  {solicitation.status === "ENVIADA" && (
                    <div className="producer-actions">
                      <button
                        className="btn-primary"
                        onClick={() => void respond(solicitation.id, "ACEITA")}
                      >
                        Aceitar
                      </button>

                      <button
                        className="btn-ghost"
                        onClick={() => void respond(solicitation.id, "RECUSADA")}
                      >
                        Recusar
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="producer-form-grid">
          <FormCard
            icon="🥬"
            eyebrow="Novo item"
            title="Cadastrar produto perecível"
            helper="Exemplo: hortaliças, frutas, grãos ou produção excedente."
            form={productForm}
            setForm={setProductForm}
            onSave={() => void saveListing("product")}
          />

          <FormCard
            icon="🌱"
            eyebrow="Economia circular"
            title="Cadastrar resíduo"
            helper="Exemplo: casca de arroz, bagaço, esterco, palha ou restos orgânicos."
            form={residueForm}
            setForm={setResidueForm}
            onSave={() => void saveListing("residue")}
          />
        </section>

        <section className="producer-table-grid">
          <ListingTable
            title="Produtos cadastrados"
            subtitle="Produção disponível para negociação"
            items={products}
          />

          <ListingTable
            title="Resíduos cadastrados"
            subtitle="Materiais com potencial de reaproveitamento"
            items={residues}
          />
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <article className="producer-stat-card">
      <div className="producer-stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{description}</p>
      </div>
    </article>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="producer-empty-state">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function FormCard({
  icon,
  eyebrow,
  title,
  helper,
  form,
  setForm,
  onSave,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  helper: string;
  form: FormState;
  setForm: (form: FormState) => void;
  onSave: () => void;
}) {
  return (
    <article className="producer-form-card">
      <div className="producer-form-head">
        <div className="producer-form-icon">{icon}</div>
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      </div>

      <p className="producer-form-helper">{helper}</p>

      <div className="producer-fields">
        <label>
          Nome
          <input
            placeholder="Ex: Tomate orgânico"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>

        <label>
          Categoria
          <input
            placeholder="Ex: Hortaliças"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          />
        </label>

        <div className="producer-field-row">
          <label>
            Quantidade
            <input
              placeholder="0"
              type="number"
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: event.target.value })}
            />
          </label>

          <label>
            Unidade
            <input
              placeholder="kg, ton, L"
              value={form.unit}
              onChange={(event) => setForm({ ...form, unit: event.target.value })}
            />
          </label>
        </div>

        <label>
          Preço
          <input
            placeholder="Ex: 15.00"
            type="number"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
          />
        </label>
      </div>

      <button className="btn-primary producer-save-button" onClick={onSave}>
        Salvar cadastro
      </button>
    </article>
  );
}

function ListingTable({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Listing[];
}) {
  return (
    <article className="producer-table-card">
      <div className="producer-table-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <span>{items.length} itens</span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="🌿"
          title="Nenhum item cadastrado"
          text="Cadastre um novo item para ele aparecer nesta lista."
        />
      ) : (
        <div className="producer-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Qtd.</th>
                <th>Preço</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <small>{item.category}</small>
                  </td>
                  <td>
                    {item.quantity} {item.unit}
                  </td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>
                    <StatusBadge>{item.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}