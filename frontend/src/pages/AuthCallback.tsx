import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/theme.css";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${error}`);
      return;
    }

    if (token) {
      setAuthData(token).then(() => {
        navigate("/dashboard");
      });
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, setAuthData]);

  return (
    <div className="min-h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
      <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', width: '100%', maxWidth: '360px', borderRadius: '32px' }}>
        <div style={{
          width: '32px', height: '32px',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 24px'
        }}></div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
          Autenticando
        </p>
      </div>
    </div>
  );
}