"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarBrand from "./SidebarBrand";

export default function AppSidebar({
  active = "",
  subtitle = "",
  footerTitle = "",
  footerLines = [],
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  function navClass(name) {
    return active === name ? "rl-nav-item active" : "rl-nav-item";
  }

  function sair() {
    localStorage.removeItem("riverlub_usuario");
    router.push("/login");
  }

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("riverlub_usuario");
      if (salvo) {
        setUsuario(JSON.parse(salvo));
      }
    } catch (e) {
      console.error("Erro ao carregar usuário logado:", e);
    }
  }, []);

  return (
    <aside className="rl-sidebar">
      <SidebarBrand subtitle={subtitle} />

      {usuario && (
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#e9f0f8",
          }}
        >
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#9fb4cf",
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Usuário logado
          </div>

          <div style={{ fontWeight: 800, color: "#fff" }}>
            {usuario.nome || "Usuário"}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#c6d4e5",
            }}
          >
            {usuario.tipo || "SEM PERFIL"}
          </div>

          <button
            className="rl-btn rl-btn-secondary"
            style={{
              marginTop: 12,
              width: "100%",
              minHeight: 38,
            }}
            onClick={sair}
          >
            Sair
          </button>
        </div>
      )}

      <nav className="rl-nav">
        <div className="rl-nav-label">Operação</div>

        <Link className={navClass("home")} href="/">
          Painel atendente
        </Link>

        <Link className={navClass("fila")} href="/fila">
          Fila de carros
        </Link>

        <Link className={navClass("cadastro")} href="/cadastro">
          Cadastro
        </Link>

        <a className={navClass("pecas")} href="#">
          Consultar peça
        </a>

        <a className={navClass("gerenciador")} href="#">
          Gerenciador de O.S
        </a>

        <a className={navClass("estoque")} href="#">
          Estoque
        </a>

        <a className={navClass("config")} href="#">
          Configurações
        </a>
      </nav>

      <div className="rl-sidebar-footer">
        {footerTitle ? <strong>{footerTitle}</strong> : null}
        {footerTitle && footerLines.length > 0 ? <br /> : null}

        {footerLines.map((line, index) => (
          <span key={index}>
            {line}
            {index < footerLines.length - 1 ? <br /> : null}
          </span>
        ))}
      </div>
    </aside>
  );
}