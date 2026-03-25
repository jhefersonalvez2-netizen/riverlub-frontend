"use client";

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
    <a href={`/os/${os.id}`} className="rl-board-card">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div className="rl-os-title">O.S #{os.id}</div>
          <span className={getStatusClass(os.status)}>{os.status}</span>
        </div>

        <div className="rl-os-meta">
          Cliente: {os.cliente || "Não informado"}
          <br />
          Veículo: {os.modelo || "Não informado"}
          <br />
          Placa: {os.placa || "-"}
        </div>

        <div
          style={{
            paddingTop: 10,
            borderTop: "1px solid var(--border)",
            color: "var(--text-soft)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {os.criado_em
            ? new Date(os.criado_em).toLocaleString("pt-BR")
            : "Sem data"}
        </div>
      </div>
    </a>
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

          <a className="rl-nav-item" href="/">
            Painel atendente
          </a>

          <a className="rl-nav-item active" href="/fila">
            Fila de carros
          </a>

          <a className="rl-nav-item" href="/cadastro">
            Cadastro
          </a>

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

          {loading ? (
            <div className="rl-card">
              <div className="rl-card-body">Carregando fila...</div>
            </div>
          ) : (
            <div className="rl-board">
              <div className="rl-board-column">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div className="rl-board-title">Abertas</div>
                  <span className="rl-badge rl-badge-open">{abertas.length}</span>
                </div>

                <div className="rl-board-stack">
                  {abertas.length === 0 && (
                    <div className="rl-empty">Nenhuma OS aberta no momento.</div>
                  )}

                  {abertas.map((os) => (
                    <CardOS key={os.id} os={os} />
                  ))}
                </div>
              </div>

              <div className="rl-board-column">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div className="rl-board-title">Finalizadas</div>
                  <span className="rl-badge rl-badge-final">{finalizadas.length}</span>
                </div>

                <div className="rl-board-stack">
                  {finalizadas.length === 0 && (
                    <div className="rl-empty">Nenhuma OS finalizada carregada.</div>
                  )}

                  {finalizadas.map((os) => (
                    <CardOS key={os.id} os={os} />
                  ))}
                </div>
              </div>

              <div className="rl-board-column">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div className="rl-board-title">Recentes</div>
                  <span className="rl-badge rl-badge-default">{recentes.length}</span>
                </div>

                <div className="rl-board-stack">
                  {recentes.length === 0 && (
                    <div className="rl-empty">Nenhuma OS recente encontrada.</div>
                  )}

                  {recentes.map((os) => (
                    <CardOS key={os.id} os={os} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}