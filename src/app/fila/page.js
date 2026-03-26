"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";
import StatusBadge from "../../components/StatusBadge";

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

function getColumnBadgeClass(status) {
  if (status === "ABERTA") return "rl-badge rl-badge-open";
  if (status === "EM_EXECUCAO") return "rl-badge rl-badge-info";
  if (status === "AGUARDANDO_APROVACAO") return "rl-badge rl-badge-danger";
  if (status === "FILA_DE_ESPERA") return "rl-badge rl-badge-default";
  if (status === "FINALIZADA") return "rl-badge rl-badge-final";
  return "rl-badge rl-badge-default";
}

function getColumnAccent(status) {
  if (status === "ABERTA") return "#f59e0b";
  if (status === "EM_EXECUCAO") return "#2563eb";
  if (status === "AGUARDANDO_APROVACAO") return "#d72638";
  if (status === "FILA_DE_ESPERA") return "#64748b";
  if (status === "FINALIZADA") return "#198754";
  return "#64748b";
}

function CardOS({ os }) {
  return (
    <div
      className="rl-board-card"
      style={{
        borderRadius: 18,
        padding: 16,
        border: "1px solid var(--border)",
        background: "#fff",
        boxShadow: "var(--shadow-sm)",
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

          <StatusBadge status={os.status} />
        </div>

        <div
          style={{
            padding: "12px 14px",
            borderRadius: 14,
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
              fontSize: 26,
              fontWeight: 900,
              color: "var(--sidebar)",
              letterSpacing: "0.04em",
            }}
          >
            {os.placa || "-"}
          </div>
        </div>

        <div className="rl-os-meta" style={{ lineHeight: 1.7 }}>
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

function ColunaFila({ titulo, statusKey, lista, vazio }) {
  const accent = getColumnAccent(statusKey);

  return (
    <div
      className="rl-board-column"
      style={{
        background: "#f4f7fb",
        borderRadius: 22,
        padding: 16,
        border: "1px solid var(--border)",
        minHeight: 220,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: `3px solid ${accent}`,
        }}
      >
        <div
          className="rl-board-title"
          style={{
            marginBottom: 0,
            fontSize: 17,
          }}
        >
          {titulo}
        </div>

        <span className={getColumnBadgeClass(statusKey)}>{lista.length}</span>
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
  const router = useRouter();

  const [listaOS, setListaOS] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

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
    const usuarioSalvo = localStorage.getItem("riverlub_usuario");

    if (!usuarioSalvo) {
      router.replace("/login");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (authChecked) {
      carregarFila();
    }
  }, [authChecked]);

  const abertas = useMemo(
    () => listaOS.filter((os) => os.status === "ABERTA"),
    [listaOS]
  );

  const emExecucao = useMemo(
    () => listaOS.filter((os) => os.status === "EM_EXECUCAO"),
    [listaOS]
  );

  const aguardandoAprovacao = useMemo(
    () => listaOS.filter((os) => os.status === "AGUARDANDO_APROVACAO"),
    [listaOS]
  );

  const filaDeEspera = useMemo(
    () => listaOS.filter((os) => os.status === "FILA_DE_ESPERA"),
    [listaOS]
  );

  const finalizadas = useMemo(
    () => listaOS.filter((os) => os.status === "FINALIZADA"),
    [listaOS]
  );

  if (!authChecked) {
    return (
      <div className="rl-auth-shell" style={{ padding: 24 }}>
        <div className="rl-auth-card">
          <div className="rl-auth-title">Verificando acesso...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rl-app">
      <AppSidebar
        active="fila"
        subtitle="Fila operacional da oficina"
        footerTitle="Resumo da fila"
        footerLines={[
          `Abertas: ${abertas.length}`,
          `Em execução: ${emExecucao.length}`,
          `Aguardando aprovação: ${aguardandoAprovacao.length}`,
          `Fila de espera: ${filaDeEspera.length}`,
          `Finalizadas: ${finalizadas.length}`,
        ]}
      />

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
                Painel operacional para acompanhar a etapa atual de cada veículo na oficina.
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

          <section className="rl-grid cols-4" style={{ marginBottom: 24 }}>
            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Abertas</div>
              <div className="rl-kpi-value">{abertas.length}</div>
              <div className="rl-kpi-foot">Recepção e entrada</div>
            </div>

            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Em execução</div>
              <div className="rl-kpi-value">{emExecucao.length}</div>
              <div className="rl-kpi-foot">Serviço em andamento</div>
            </div>

            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Aguardando aprovação</div>
              <div className="rl-kpi-value">{aguardandoAprovacao.length}</div>
              <div className="rl-kpi-foot">Orçamento pendente</div>
            </div>

            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Fila de espera</div>
              <div className="rl-kpi-value">{filaDeEspera.length}</div>
              <div className="rl-kpi-foot">Aprovadas, aguardando vaga</div>
            </div>
          </section>

          {loading ? (
            <div className="rl-card">
              <div className="rl-card-body">Carregando fila...</div>
            </div>
          ) : (
            <>
              <section className="rl-grid cols-4" style={{ marginBottom: 24 }}>
                <ColunaFila
                  titulo="Abertas"
                  statusKey="ABERTA"
                  lista={abertas}
                  vazio="Nenhuma OS aberta no momento."
                />

                <ColunaFila
                  titulo="Em execução"
                  statusKey="EM_EXECUCAO"
                  lista={emExecucao}
                  vazio="Nenhuma OS em execução."
                />

                <ColunaFila
                  titulo="Aguardando aprovação"
                  statusKey="AGUARDANDO_APROVACAO"
                  lista={aguardandoAprovacao}
                  vazio="Nenhuma OS aguardando aprovação."
                />

                <ColunaFila
                  titulo="Fila de espera"
                  statusKey="FILA_DE_ESPERA"
                  lista={filaDeEspera}
                  vazio="Nenhuma OS na fila de espera."
                />
              </section>

              <section className="rl-section">
                <div className="rl-card">
                  <div className="rl-card-header">
                    <div className="rl-card-title">Finalizadas</div>
                    <div className="rl-card-subtitle">
                      Ordens concluídas e prontas para consulta histórica.
                    </div>
                  </div>

                  <div className="rl-card-body">
                    {finalizadas.length === 0 ? (
                      <div className="rl-empty">Nenhuma OS finalizada carregada.</div>
                    ) : (
                      <div className="rl-list">
                        {finalizadas.map((os) => (
                          <CardOS key={os.id} os={os} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}