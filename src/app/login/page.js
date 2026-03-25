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
      // Placeholder temporário até implementar autenticação real
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
    <div className="rl-auth-shell">
      <div className="rl-auth-card">
        <div className="rl-auth-logo">
          <div className="rl-brand-title" style={{ fontSize: 40 }}>
            <span className="accent">River</span>Lub
          </div>
          <div className="rl-auth-subtitle">
            Sistema operacional para oficinas mecânicas
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 className="rl-auth-title">Entrar no sistema</h1>
          <p className="rl-auth-subtitle" style={{ marginTop: 8 }}>
            Acesse o painel da oficina com seu usuário e senha.
          </p>
        </div>

        <form onSubmit={entrar} className="rl-form-grid" style={{ gridTemplateColumns: "1fr" }}>
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

          <div className="rl-field" style={{ marginTop: 6 }}>
            <button className="rl-btn rl-btn-success" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: 20,
            paddingTop: 18,
            borderTop: "1px solid var(--border)",
            textAlign: "center",
            color: "var(--text-soft)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          RiverLub • operação rápida para oficinas
        </div>
      </div>
    </div>
  );
}