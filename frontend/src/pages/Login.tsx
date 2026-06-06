// src/pages/Login.tsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/theme.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function MiniRingCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let id: number, t = 0;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const isDark = () => document.documentElement.classList.contains("dark");
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const rings = [
        { r: 60,  dots: 28, speed: 0.0005,  opacity: 0.2,  size: 1.5 },
        { r: 100, dots: 44, speed: -0.0003, opacity: 0.17, size: 1.3 },
        { r: 145, dots: 60, speed: 0.0002,  opacity: 0.14, size: 1.1 },
        { r: 195, dots: 76, speed: -0.00015,opacity: 0.11, size: 0.9 },
        { r: 250, dots: 90, speed: 0.0001,  opacity: 0.08, size: 0.8 },
      ];
      const base = isDark() ? "255,255,255" : "80,70,60";
      rings.forEach(({ r, dots, speed, opacity, size }) => {
        const off = t * speed * 1000;
        for (let i = 0; i < dots; i++) {
          const angle = (i / dots) * Math.PI * 2 + off;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          const b = 0.5 + 0.5 * Math.sin(t * 0.001 + i * 0.5);
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${base},${opacity * (0.6 + 0.4 * b)})`;
          ctx.fill();
        }
      });
      t++;
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); observer.disconnect(); };
  }, []);
  return <canvas ref={ref} className="auth-panel-canvas" />;
}

function DarkModeToggle() {
  const toggle = () => document.documentElement.classList.toggle("dark");
  return (
    <button className="dark-toggle" onClick={toggle} aria-label="Alternar modo escuro">
      <span className="dark-toggle-icon">◐</span>
    </button>
  );
}

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => { window.location.href = `${API_URL}/auth/google`; };
  const handleGitHubLogin  = () => { window.location.href = `${API_URL}/auth/github`; };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-panel-left">
        <MiniRingCanvas />
        <div className="auth-panel-brand">
          <span className="auth-panel-icon">◈</span>
          <span className="auth-panel-name">HACKATHON</span>
          <p className="auth-panel-tagline">Sua plataforma de inovação</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <div className="auth-top-bar">
          <DarkModeToggle />
        </div>

        <div className="auth-form-wrap">
          <h1 className="auth-heading">Bem-vindo de volta</h1>
          <p className="auth-sub">Faça login para continuar</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email" className="field-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="field-input"
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password" className="field-label">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="field-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-submit">
              {isLoading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">ou continue com</span>
            <div className="auth-divider-line" />
          </div>

          <div className="social-grid">
            <button onClick={handleGoogleLogin} type="button" className="btn-social">
              <svg viewBox="0 0 24 24" fill="none">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            <button onClick={handleGitHubLogin} type="button" className="btn-social">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
              GitHub
            </button>
          </div>

          <p className="auth-redirect">
            Não tem uma conta?{" "}
            <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}