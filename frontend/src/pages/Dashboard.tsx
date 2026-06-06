import { useAuth } from "../contexts/AuthContext";
import "../styles/theme.css";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', padding: '40px 24px' }}>
      
      {/* Navbar Glass */}
      <nav className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', marginBottom: '40px', borderRadius: '100px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, margin: 0 }}>ApoioBPO</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '14px' }}>Olá, <strong>{user?.name}</strong></span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', background: 'var(--accent-muted)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
            {user?.role}
          </span>
          <button onClick={logout} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '14px' }}>
            Sair
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Welcome Panel */}
        <div className="dash-info-panel glass-panel" style={{ marginBottom: '32px' }}>
          <h2 className="dash-info-title">Visão Geral</h2>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', marginBottom: '8px', lineHeight: 1.2 }}>
            Bem-vindo ao seu painel.
          </p>
          <p className="dash-card-body">O sistema está operando perfeitamente e os serviços estão sincronizados.</p>
        </div>

        {/* Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div className="dash-card accent-green glass-panel">
            <h3 className="dash-card-label">Status do Servidor</h3>
            <p className="dash-card-title">Operacional</p>
            <p className="dash-card-body">Tempo de resposta: 42ms</p>
          </div>
          <div className="dash-card accent-blue glass-panel">
            <h3 className="dash-card-label">Sessão</h3>
            <p className="dash-card-title">Autenticada</p>
            <p className="dash-card-body">Token validado com sucesso.</p>
          </div>
        </div>

        {/* User Data Panel */}
        <div className="dash-info-panel glass-panel">
          <h3 className="dash-info-title">Seus Dados</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div>
              <p className="dash-card-label">Nome Completo</p>
              <p style={{ fontSize: '15px' }}>{user?.name}</p>
            </div>
            <div>
              <p className="dash-card-label">Email de Acesso</p>
              <p style={{ fontSize: '15px' }}>{user?.email}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="dash-card-label">ID de Registro</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>{user?.id}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}