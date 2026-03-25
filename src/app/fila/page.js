"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!isJson) {
    const text = await response.text();
    throw new Error(text || "Resposta inválida da API");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || "Erro na requisição");
  }

  return data;
}

function getStatusClass(status) {
  if (status === "FINALIZADA") return "rl-badge rl-badge-final";
  if (status === "ABERTA") return "rl-badge rl-badge-open";
  return "rl-badge rl-badge-default";
}

function CardOS({ os }) {
  return (
    <div
      className="rl-board-card"
      style={{
        borderRadius: 16,
        padding: 16,
        border: "1px solid var(--border)",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--text-soft)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Ordem de serviço
            </div>
            <div className="rl-os-title" style={{ marginTop: 4 }}>
              O.S #{os.id}
            </div>
          </div>

          <span className={getStatusClass(os.status)}>{os.status}</span>
        </div>

        <div
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "var(--text-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Placa
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 24,
              fontWeight: 900,
              color: "var(--sidebar)",
              letterSpacing: "0.03em",
            }}
          >
            {os.placa || "-"}
          </div>
        </div>

        <div className="rl-os-meta" style={{ lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text)" }}>Cliente:</strong>{" "}
          {os.cliente || "Não informado"}
          <br />
          <strong style={{ color: "var(--text)" }}>Veículo:</strong>{" "}
          {os.modelo || "Não informado"}
        </div>

        <div
          style={{
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              color: "var(--text-soft)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {os.criado_em
              ? new Date(os.criado_em).toLocaleString("pt-BR")
              : "Sem data"}
          </div>

          <Link
            href={`/os/${os.id}`}
            className="rl-btn rl-btn-dark"
            style={{ minHeight: 38 }}
          >
            Abrir O.S
          </Link>
        </div>
      </div>
    </div>
  );
}

function ColunaFila({ titulo, quantidade, badgeClass, lista, vazio }) {
  return (
    <div
      className="rl-board-column"
      style={{
        background: "#f4f7fb",
        borderRadius: 20,
        padding: 16,
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div className="rl-board-title" style={{ marginBottom: 0 }}>
          {titulo}
        </div>
        <span className={badgeClass}>{quantidade}</span>
      </div>

      <div className="rl-board-stack">
        {lista.length === 0 && <div className="rl-empty">{vazio}</div>}
        {lista.map((os) => (
          <CardOS key={os.id} os={os} />
        ))}
      </div>
    </div>
  );
}

export default function FilaPage() {
  const [listaOS, setListaOS] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarFila() {
    try {
      setErro("");
      setLoading(true);

      const data = await apiFetch(`${API}/os/listar`);

      if (data.sucesso) {
        setListaOS(data.os || []);
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar fila de carros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarFila();
  }, []);

  const abertas = useMemo(
    () => listaOS.filter((os) => os.status === "ABERTA"),
    [listaOS]
  );

  const finalizadas = useMemo(
    () => listaOS.filter((os) => os.status === "FINALIZADA"),
    [listaOS]
  );

  const recentes = useMemo(() => listaOS.slice(0, 10), [listaOS]);

  return (
    <div className="rl-app">
      <aside className="rl-sidebar">
        <div className="rl-brand" style={{ alignItems: "flex-start" }}>
          <img
            src="/icon-512.png"
            alt="RiverLub"
            style={{
              width: 138,
              height: "auto",
              objectFit: "contain",
            }}
          />
          <div className="rl-brand-subtitle">Fila operacional da oficina</div>
        </div>

        <nav className="rl-nav">
          <div className="rl-nav-label">Operação</div>

          <Link className="rl-nav-item" href="/">
            Painel atendente
          </Link>

          <Link className="rl-nav-item active" href="/fila">
            Fila de carros
          </Link>

          <Link className="rl-nav-item" href="/cadastro">
            Cadastro
          </Link>

          <a className="rl-nav-item" href="#">
            Consultar peça
          </a>

          <a className="rl-nav-item" href="#">
            Gerenciador de O.S
          </a>

          <a className="rl-nav-item" href="#">
            Estoque
          </a>

          <a className="rl-nav-item" href="#">
            Configurações
          </a>
        </nav>

        <div className="rl-sidebar-footer">
          <strong>Resumo da fila</strong>
          <br />
          Abertas: {abertas.length}
          <br />
          Finalizadas: {finalizadas.length}
          <br />
          Recentes: {recentes.length}
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="rl-mobile-top">
          <img
            src="/icon-512.png"
            alt="RiverLub"
            style={{
              width: 120,
              height: "auto",
              objectFit: "contain",
            }}
          />
          <div className="rl-brand-subtitle" style={{ marginTop: 6 }}>
            Fila de carros
          </div>
        </div>

        <main className="rl-main">
          <div className="rl-topbar">
            <div>
              <h1 className="rl-page-title">Fila de carros</h1>
              <p className="rl-page-subtitle">
                Visual operacional das ordens de serviço para acompanhamento rápido da oficina.
              </p>
            </div>

            <div className="rl-topbar-actions">
              <Link href="/cadastro" className="rl-btn rl-btn-success">
                Nova O.S
              </Link>

              <button className="rl-btn rl-btn-secondary" onClick={carregarFila}>
                Atualizar fila
              </button>
            </div>
          </div>

          {erro && (
            <div className="rl-alert rl-alert-danger" style={{ marginBottom: 18 }}>
              {erro}
            </div>
          )}

          <section className="rl-grid cols-3" style={{ marginBottom: 24 }}>
            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Abertas</div>
              <div className="rl-kpi-value">{abertas.length}</div>
              <div className="rl-kpi-foot">Ordens em atendimento</div>
            </div>

            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Finalizadas</div>
              <div className="rl-kpi-value">{finalizadas.length}</div>
              <div className="rl-kpi-foot">Serviços concluídos</div>
            </div>

            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Recentes</div>
              <div className="rl-kpi-value">{recentes.length}</div>
              <div className="rl-kpi-foot">Últimas O.S carregadas</div>
            </div>
          </section>

          {loading ? (
            <div className="rl-card">
              <div className="rl-card-body">Carregando fila...</div>
            </div>
          ) : (
            <div className="rl-board">
              <ColunaFila
                titulo="Abertas"
                quantidade={abertas.length}
                badgeClass="rl-badge rl-badge-open"
                lista={abertas}
                vazio="Nenhuma OS aberta no momento."
              />

              <ColunaFila
                titulo="Finalizadas"
                quantidade={finalizadas.length}
                badgeClass="rl-badge rl-badge-final"
                lista={finalizadas}
                vazio="Nenhuma OS finalizada carregada."
              />

              <ColunaFila
                titulo="Recentes"
                quantidade={recentes.length}
                badgeClass="rl-badge rl-badge-default"
                lista={recentes}
                vazio="Nenhuma OS recente encontrada."
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}