// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import "../styles/theme.css";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const isDark = () => document.documentElement.classList.contains("dark");

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const rings = [
        { r: 80,  dots: 32,  speed: 0.0004,  opacity: 0.18, size: 1.6 },
        { r: 130, dots: 48,  speed: -0.0003, opacity: 0.20, size: 1.4 },
        { r: 185, dots: 64,  speed: 0.00025, opacity: 0.18, size: 1.3 },
        { r: 240, dots: 80,  speed: -0.0002, opacity: 0.16, size: 1.2 },
        { r: 300, dots: 96,  speed: 0.00015, opacity: 0.14, size: 1.1 },
        { r: 365, dots: 112, speed: -0.0001, opacity: 0.12, size: 1.0 },
        { r: 435, dots: 128, speed: 0.00008, opacity: 0.10, size: 0.9 },
      ];

      const dark = isDark();
      const baseColor = dark ? "255,255,255" : "80,70,60";

      rings.forEach(({ r, dots, speed, opacity, size }) => {
        const offset = t * speed * 1000;
        for (let i = 0; i < dots; i++) {
          const angle = (i / dots) * Math.PI * 2 + offset;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;

          // Breathing effect per dot
          const breathe = 0.5 + 0.5 * Math.sin(t * 0.0008 + i * 0.4);
          const alpha = opacity * (0.6 + 0.4 * breathe);

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${baseColor},${alpha})`;
          ctx.fill();
        }
      });

      t++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="home-root">
      <canvas ref={canvasRef} className="home-canvas" />

      {/* Nav */}
      <nav className="home-nav">
        <div className="home-nav-brand">
          <span className="home-nav-icon">◈</span>
          <span className="home-nav-title">HACKATHON</span>
        </div>
        <div className="home-nav-right">
          <DarkModeToggle />
          <Link to="/login" className="home-nav-link">Entrar →</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="home-hero">
        <p className="home-eyebrow">A PLATAFORMA DO SEU PROJETO</p>
        <h1 className="home-headline">
          Uma Experiência<br />Além do Comum
        </h1>
        <p className="home-sub">
          Construa, colabore e inove — tudo em um só lugar.
        </p>
        <div className="home-cta-group">
          <Link to="/cadastro" className="btn-primary">Criar Conta</Link>
          <Link to="/login" className="btn-ghost">Já tenho conta</Link>
        </div>
      </main>

      {/* Bottom bar */}
      <footer className="home-footer">
        <span className="home-footer-stat">
          <span className="home-footer-dot" />
          Sistema online
        </span>
        <span className="home-footer-label">SCROLL ↓</span>
        <span className="home-footer-stat">
          v1.0.0 · 2024
        </span>
      </footer>
    </div>
  );
}

function DarkModeToggle() {
  const toggle = () => {
    document.documentElement.classList.toggle("dark");
  };
  return (
    <button className="dark-toggle" onClick={toggle} aria-label="Alternar modo escuro">
      <span className="dark-toggle-icon">◐</span>
    </button>
  );
}