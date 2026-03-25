import Link from "next/link";
import SidebarBrand from "./SidebarBrand";

export default function AppSidebar({
  active = "",
  subtitle = "",
  footerTitle = "",
  footerLines = [],
}) {
  function navClass(name) {
    return active === name ? "rl-nav-item active" : "rl-nav-item";
  }

  return (
    <aside className="rl-sidebar">
      <SidebarBrand subtitle={subtitle} />

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