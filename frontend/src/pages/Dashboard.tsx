import React from 'react';
import { useAuth } from "../contexts/AuthContext";
import "../styles/theme.css";

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Dados simulados para o painel
  const availableProducts = [
    { id: 'PRD-001', name: 'Casca de Arroz', type: 'Biomassa', qtd: '2.5 ton', price: 'R$ 150/ton', status: 'Disponível' },
    { id: 'PRD-002', name: 'Farelo Orgânico', type: 'Ração Animal', qtd: '800 kg', price: 'R$ 2,00/kg', status: 'Em negociação' },
    { id: 'PRD-003', name: 'Esterco Bovino', type: 'Biofertilizante', qtd: '1.2 ton', price: 'R$ 80/ton', status: 'Disponível' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', padding: '40px 24px' }}>
      
      {/* Navbar Glass */}
      <nav className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', marginBottom: '40px', borderRadius: '100px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🌱</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, margin: 0 }}>ConectaCampo</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '14px' }}>Olá, <strong>{user?.name || "Produtor"}</strong></span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', background: 'var(--accent-muted)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
            {user?.role || "Vendedor"}
          </span>
          <button onClick={logout} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '14px' }}>
            Sair
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Welcome Panel */}
        <div className="dash-info-panel" style={{ marginBottom: '32px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Visão Geral da Produção
          </h2>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', marginBottom: '8px', lineHeight: 1.2 }}>
            Seu impacto este mês.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Você já transformou resíduos em renda e ajudou a fomentar a indústria sustentável.
          </p>
        </div>

        {/* Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          <div className="dash-card accent-green" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Volume Reaproveitado</h3>
              <span style={{ fontSize: '20px' }}>📦</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: '0 0 4px 0' }}>4.5 Tons</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px' }}>📈</span> +12% em relação ao mês passado
            </p>
          </div>

          <div className="dash-card accent-blue" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Renda Gerada</h3>
              <span style={{ fontSize: '20px' }}>📊</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: '0 0 4px 0' }}>R$ 1.240,00</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Proveniente de 3 vendas concluídas</p>
          </div>

          <div className="dash-card accent-orange" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Logística Otimizada</h3>
              <span style={{ fontSize: '20px' }}>🚚</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: '0 0 4px 0' }}>2 Rotas</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Coletas agendadas para esta semana</p>
          </div>
        </div>

        {/* Charts and Tables Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
          
          {/* Gráfico Simplificado (Barras) */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
             <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Composição de Resíduos
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Casca de Arroz', percent: 65, color: 'var(--accent)' },
                { label: 'Farelo', percent: 25, color: '#4A90D9' },
                { label: 'Esterco', percent: 10, color: '#E06A3A' },
              ].map((item, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span>{item.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{item.percent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-alt)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.percent}%`, height: '100%', backgroundColor: item.color, borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabela de Produtos */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Seus Produtos Cadastrados
              </h3>
              <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>Ver Todos <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>→</span></button>
            </div>
            
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Produto</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Categoria</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Quantidade</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Valor Ref.</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {availableProducts.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 0', fontSize: '14px', fontWeight: 500 }}>{prod.name}</td>
                    <td style={{ padding: '16px 0', fontSize: '14px', color: 'var(--text-muted)' }}>{prod.type}</td>
                    <td style={{ padding: '16px 0', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{prod.qtd}</td>
                    <td style={{ padding: '16px 0', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{prod.price}</td>
                    <td style={{ padding: '16px 0' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: prod.status === 'Disponível' ? 'var(--accent-muted)' : 'rgba(224, 106, 58, 0.1)', 
                        color: prod.status === 'Disponível' ? 'var(--accent)' : '#E06A3A',
                        fontWeight: 'bold' 
                      }}>
                        {prod.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}