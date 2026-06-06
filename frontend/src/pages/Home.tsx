// src/pages/Home.tsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import "../styles/theme.css";
import logo from "../assets/logo.png"; 
import backgroundHome from "../assets/background-home.png";

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
    <div
      className="home-root relative min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(3, 10, 5, 0.68), rgba(3, 10, 5, 0.78)), url(${backgroundHome})`,
      }}
    >
      {/* Canvas fixo no fundo */}
      <canvas ref={canvasRef} className="home-canvas fixed inset-0 w-full h-full pointer-events-none z-0" />

      {/* Container do conteúdo que fica por cima do canvas */}
      <div className="relative z-10">
        
        {/* Nav */}
        <nav className="home-nav flex justify-between items-center p-6">
          <div className="home-nav-brand flex items-center gap-3">
            <img 
              src={logo} 
              alt="Logo ConectaCampo" 
              className="home-logo"
            />
          </div>
          <div className="home-nav-right flex items-center gap-4">
            <DarkModeToggle />
            <Link to="/login" className="home-nav-link">Entrar →</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="home-hero min-h-[90vh] flex flex-col justify-center items-center text-center px-4">
          <p className="home-eyebrow mb-4">
            DO PRODUTOR AO CONSUMIDOR
          </p>
          <h1 className="home-headline text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Sem desperdício.<br />
            <span className="text-[var(--accent)]">Valorizando o Campo.</span>
          </h1>
          <p className="home-sub text-lg md:text-xl max-w-2xl mx-auto mb-10">
            A ConectaCampo transforma excedentes, resíduos e produtos orgânicos de pequenos produtores em oportunidades de negócio para toda a cadeia produtiva.
          </p>
          <div className="home-cta-group flex gap-4">
            <Link to="/cadastro" className="btn-primary">
              Criar Conta
            </Link>
            <Link to="/login" className="btn-ghost">
              Já tenho conta
            </Link>
          </div>
        </main>

        {/* Bottom bar */}
        <footer className="home-footer flex justify-between w-full px-8 pb-8">
          <span className="home-footer-stat flex items-center gap-2">
            <span className="home-footer-dot animate-pulse" />
            Sistema online
          </span>
          <span className="home-footer-label animate-bounce">SCROLL ↓</span>
          <span className="home-footer-stat">
            v1.0.0 · 2026
          </span>
        </footer>

        {/* --- CONTEÚDO ORIGINAL DA CONECTACAMPO --- */}
        <div className="flex flex-col gap-24 py-24 bg-[var(--bg-surface)]/80 backdrop-blur-md">
          
          {/* Como Funciona Section */}
          <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--text)] mb-4">Como funciona</h2>
              <p className="text-[var(--text-muted)] max-w-2xl mx-auto">Conectamos o campo à indústria sustentável de forma simples e transparente.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: "✅",
                  title: "O produtor se cadastra",
                  desc: "O pequeno produtor cria sua conta e informa seus dados."
                },
                {
                  icon: "📦",
                  title: "Cadastra resíduos e produtos",
                  desc: "Ele registra resíduos, excedentes ou produtos orgânicos disponíveis."
                },
                {
                  icon: "🔄",
                  title: "A ConectaCampo analisa e negocia",
                  desc: "O sistema sugere valores e a empresa avalia a compra."
                },
                {
                  icon: "🚚",
                  title: "Coleta, revenda e impacto",
                  desc: "Organizamos a logística e vendemos para empresas compradoras."
                }
              ].map((item, i) => (
                 <div key={i} className="bg-[var(--bg)] p-8 rounded-2xl shadow-sm border border-[var(--border)] flex flex-col items-center text-center transition-all hover:-translate-y-1">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent-muted)] flex items-center justify-center mb-6 text-2xl">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[var(--text)]">{item.title}</h3>
                    <p className="text-[var(--text-muted)]">{item.desc}</p>
                 </div>
              ))}
            </div>
          </section>

          {/* O Problema & A Solução */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-[var(--text)] mb-6">O problema</h2>
                  <p className="text-[var(--text-muted)] text-lg leading-relaxed">
                    Pequenos produtores rurais geram diariamente resíduos, excedentes e subprodutos que muitas vezes são descartados, acumulados ou vendidos sem valorização. Enquanto isso, empresas e indústrias buscam matérias-primas sustentáveis, rastreáveis e com origem confiável.
                  </p>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[var(--accent)] mb-6">A solução</h2>
                  <p className="text-[var(--text-muted)] text-lg leading-relaxed">
                    A ConectaCampo conecta esses dois lados. Compramos resíduos e excedentes de pequenos produtores, organizamos informações, logística e rastreabilidade, e revendemos esses materiais para empresas que os utilizam em novos produtos, como biofertilizantes, compostagem, biogás, ração alternativa, biochar, biomassa e outros insumos sustentáveis.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* O Que Compramos */}
          <section id="residuos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--text)] mb-4">O que compramos</h2>
              <p className="text-[var(--text-muted)] max-w-2xl mx-auto">Os principais resíduos que podem ser transformados em novos produtos.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Palha de milho", "Frutas estragadas", "Hortaliças fora do padrão",
                "Soro de leite", "Esterco bovino, suíno e aviário", "Bagaço de frutas",
                "Cascas e podas", "Restos de lavoura", "Resíduos de agroindústrias"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)]">
                   <span className="text-xl flex-shrink-0">🍃</span>
                   <span className="font-semibold text-[var(--text)]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Orgânicos */}
          <section id="organicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                 <div className="w-16 h-16 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center mb-6 text-3xl">
                   🌱
                 </div>
                 <h2 className="text-3xl font-bold text-[var(--text)] mb-6">Produtos orgânicos</h2>
                 <p className="text-[var(--text-muted)] text-lg mb-6 leading-relaxed">
                  Produtores que trabalham com produtos orgânicos podem cadastrar sua produção, informar quantidade disponível, preço desejado e solicitar uma verificação técnica da ConectaCampo. Nossa equipe, com apoio de agrônomos parceiros, poderá realizar visitas, analisar documentos e gerar um relatório de conformidade para aumentar a confiança nas negociações.
                 </p>
                 <div className="bg-[var(--accent-muted)] border border-[var(--border)] text-[var(--text)] p-4 rounded-xl mb-8 text-sm">
                   <strong>Aviso:</strong> A verificação ConectaCampo não substitui certificações oficiais exigidas por órgãos competentes. Ela funciona como uma análise técnica privada para aumentar transparência, organização e confiança comercial.
                 </div>
                 <Link to="/cadastro" className="btn-primary">
                   Cadastrar produtos orgânicos
                 </Link>
              </div>
              <div className="lg:w-1/2">
                <img src="https://images.unsplash.com/photo-1595841696677-6489bbecf16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Agricultura Orgânica" className="rounded-2xl shadow-lg object-cover h-[500px] w-full border border-[var(--border)]" />
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 mt-12">
            <h2 className="text-4xl font-bold text-[var(--text)] mb-6">O que era descarte agora pode virar renda.</h2>
            <p className="text-lg text-[var(--text-muted)] mb-8">
              Cadastre sua produção, acompanhe seu histórico e transforme resíduos em oportunidades reais de negócio.
            </p>
            <Link to="/cadastro" className="btn-primary">
              Começar agora <span className="ml-2 font-bold">→</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function DarkModeToggle() {
  const toggle = () => {
    document.documentElement.classList.toggle("dark");
  };
  return (
    <button className="dark-toggle w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-alt)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition" onClick={toggle} aria-label="Alternar modo escuro">
      <span className="dark-toggle-icon">◐</span>
    </button>
  );
}