"use client";

import { useState } from "react";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar(e) {
    e.preventDefault();

    if (!usuario.trim() || !senha.trim()) {
      alert("Preencha usuário e senha.");
      return;
    }

    setLoading(true);

    try {
      setTimeout(() => {
        alert("Login visual pronto. Próximo passo: conectar autenticação real.");
        setLoading(false);
      }, 700);
    } catch (error) {
      console.error(error);
      alert("Erro ao entrar.");
      setLoading(false);
    }
  }

  return (
    <div
      className="rl-auth-shell"
      style={{
        padding: 24,
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 28%), linear-gradient(180deg, #011544 0%, #08246f 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          minHeight: 580,
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          background: "#ffffff",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.28)",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(1,21,82,0.98) 0%, rgba(8,36,111,0.98) 100%)",
            color: "#fff",
            padding: 44,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div>
            <img
              src="/icon-512.png"
              alt="RiverLub"
              style={{
                width: 170,
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>

          <div style={{ maxWidth: 380 }}>
            <div
              style={{
                fontSize: 38,
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
              }}
            >
              Controle operacional para oficinas que precisam de velocidade.
            </div>

            <p
              style={{
                marginTop: 18,
                color: "rgba(255,255,255,0.78)",
                fontSize: 16,
                lineHeight: 1.7,
              }}
            >
              Crie ordens de serviço, acompanhe veículos, organize orçamento,
              use diagnóstico com IA e centralize a rotina da oficina em um só lugar.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              OS rápida
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Diagnóstico IA
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Catálogo integrado
            </div>
          </div>
        </div>

        <div
          style={{
            padding: 44,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#ffffff",
          }}
        >
          <div style={{ maxWidth: 360, width: "100%", margin: "0 auto" }}>
            <div style={{ marginBottom: 30 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Acesso ao sistema
              </div>

              <h1
                style={{
                  marginTop: 10,
                  fontSize: 36,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: "#011544",
                  letterSpacing: "-0.03em",
                }}
              >
                Entrar no RiverLub
              </h1>

              <p
                style={{
                  marginTop: 12,
                  color: "var(--text-soft)",
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                Use seu usuário e senha para acessar o painel da oficina.
              </p>
            </div>

            <form
              onSubmit={entrar}
              className="rl-form-grid"
              style={{ gridTemplateColumns: "1fr" }}
            >
              <div className="rl-field">
                <label className="rl-label">Usuário</label>
                <input
                  className="rl-input"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={usuario}
                  autoComplete="username"
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>

              <div className="rl-field">
                <label className="rl-label">Senha</label>
                <input
                  className="rl-input"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  autoComplete="current-password"
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>

              <div className="rl-field" style={{ marginTop: 8 }}>
                <button className="rl-btn rl-btn-success" type="submit" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </form>

            <div
              style={{
                marginTop: 26,
                paddingTop: 18,
                borderTop: "1px solid var(--border)",
                color: "var(--text-soft)",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              RiverLub • operação rápida para oficinas
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1.05fr 0.95fr"] {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}