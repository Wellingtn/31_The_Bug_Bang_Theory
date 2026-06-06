import { useAuth } from "../../contexts/AuthContext";

interface TopBarProps {
  title: string;
  subtitle: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", marginBottom: "28px", borderRadius: "28px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", gap: "16px", flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", margin: 0 }}>🌱 {title}</h1>
        <p style={{ color: "var(--text-muted)", margin: "4px 0 0", fontSize: "14px" }}>{subtitle}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "14px" }}>Olá, <strong>{user?.name}</strong></span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", textTransform: "uppercase", background: "var(--accent-muted)", color: "var(--accent)", padding: "4px 12px", borderRadius: "20px", fontWeight: "bold" }}>{user?.role}</span>
        <button onClick={logout} className="btn-ghost" style={{ padding: "8px 16px", fontSize: "14px" }}>Sair</button>
      </div>
    </nav>
  );
}
