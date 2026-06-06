// src/pages/Register.tsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/theme.css";

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
        { r: 60,  dots: 28, speed: 0.0005,   opacity: 0.2,  size: 1.5 },
        { r: 100, dots: 44, speed: -0.0003,  opacity: 0.17, size: 1.3 },
        { r: 145, dots: 60, speed: 0.0002,   opacity: 0.14, size: 1.1 },
        { r: 195, dots: 76, speed: -0.00015, opacity: 0.11, size: 0.9 },
        { r: 250, dots: 90, speed: 0.0001,   opacity: 0.08, size: 0.8 },
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

export default function Register() {
  const { register } = useAuth();
  const [name, setName]                   = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirm]     = useState("");
  const [error, setError]                 = useState("");
  const [isLoading, setIsLoading]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("As senhas não coincidem"); return; }
    if (password.length < 6)          { setError("A senha deve ter pelo menos 6 caracteres"); return; }
    setIsLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-panel-left">
        <MiniRingCanvas />
        <div className="auth-panel-brand">
          <span className="auth-panel-icon">◈</span>
          <span className="auth-panel-name">HACKATHON</span>
          <p className="auth-panel-tagline">Comece sua jornada hoje</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <div className="auth-top-bar">
          <DarkModeToggle />
        </div>

        <div className="auth-form-wrap">
          <h1 className="auth-heading">Criar conta</h1>
          <p className="auth-sub">Preencha os dados para se cadastrar</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name" className="field-label">Nome completo</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="field-input"
                placeholder="Seu nome"
                autoComplete="name"
              />
            </div>

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
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label htmlFor="confirmPassword" className="field-label">Confirmar senha</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirm(e.target.value)}
                required
                className="field-input"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-submit">
              {isLoading ? "Criando conta…" : "Criar conta"}
            </button>
          </form>

          <p className="auth-redirect">
            Já tem uma conta?{" "}
            <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}