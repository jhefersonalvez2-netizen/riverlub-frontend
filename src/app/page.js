"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../components/AppSidebar";
import StatusBadge from "../components/StatusBadge";

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

export default function Home() {
  const router = useRouter();

  const [listaOS, setListaOS] = useState([]);
  const [erro, setErro] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  async function carregarOS() {
    try {
      setErro("");
      const data = await apiFetch(`${API}/os/listar`);

      if (data.sucesso) {
        setListaOS(data.os || []);
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar ordens de serviço.");
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
      carregarOS();
    }
  }, [authChecked]);

  const totalOS = listaOS.length;

  const abertas = useMemo(
    () => listaOS.filter((item) => item.status === "ABERTA").length,
    [listaOS]
  );

  const finalizadas = useMemo(
    () => listaOS.filter((item) => item.status === "FINALIZADA").length,
    [listaOS]
  );

  const recentes = useMemo(() => listaOS.slice(0, 8), [listaOS]);

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
        active="home"
        subtitle="Sistema operacional para oficinas"
        footerTitle="Status do sistema"
        footerLines={[
          "Fluxo principal ativo",
          "IA disponível",
          "Catálogo externo em validação",
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
            Painel atendente
          </div>
        </div>

        <main className="rl-main">
          <div className="rl-topbar">
            <div>
              <h1 className="rl-page-title">Painel atendente</h1>
              <p className="rl-page-subtitle">
                Acompanhe os principais números da oficina, acesse as ordens de
                serviço recentes e inicie novos atendimentos rapidamente.
              </p>
            </div>

            <div className="rl-topbar-actions">
              <Link href="/cadastro" className="rl-btn rl-btn-success">
                Nova O.S
              </Link>

              <button className="rl-btn rl-btn-secondary" onClick={carregarOS}>
                Atualizar painel
              </button>
            </div>
          </div>

          {erro && (
            <div className="rl-alert rl-alert-danger" style={{ marginBottom: 18 }}>
              {erro}
            </div>
          )}

          <section className="rl-grid cols-3">
            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Ordens de serviço</div>
              <div className="rl-kpi-value">{totalOS}</div>
              <div className="rl-kpi-foot">Total carregado no painel</div>
            </div>

            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">OS abertas</div>
              <div className="rl-kpi-value">{abertas}</div>
              <div className="rl-kpi-foot">Em atendimento no momento</div>
            </div>

            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">OS finalizadas</div>
              <div className="rl-kpi-value">{finalizadas}</div>
              <div className="rl-kpi-foot">Concluídas no sistema</div>
            </div>
          </section>

          <section className="rl-section">
            <div className="rl-grid cols-2">
              <div className="rl-card">
                <div className="rl-card-header">
                  <div className="rl-card-title">Ações rápidas</div>
                  <div className="rl-card-subtitle">
                    Atalhos operacionais para acelerar o atendimento.
                  </div>
                </div>

                <div className="rl-card-body">
                  <div className="rl-inline">
                    <Link href="/cadastro" className="rl-btn rl-btn-success">
                      Abrir nova O.S
                    </Link>

                    <Link href="/fila" className="rl-btn rl-btn-secondary">
                      Ver fila de carros
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rl-card">
                <div className="rl-card-header">
                  <div className="rl-card-title">Visão operacional</div>
                  <div className="rl-card-subtitle">
                    Resumo rápido do momento atual da oficina.
                  </div>
                </div>

                <div className="rl-card-body">
                  <div className="rl-os-meta" style={{ fontSize: 15 }}>
                    • {abertas} ordem(ns) aberta(s) aguardando acompanhamento
                    <br />
                    • {finalizadas} ordem(ns) finalizada(s) registradas
                    <br />
                    • {recentes.length} ordem(ns) recente(s) exibida(s) no painel
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rl-section">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Ordens de serviço recentes</div>
                <div className="rl-card-subtitle">
                  Acesso rápido às últimas O.S cadastradas no sistema.
                </div>
              </div>

              <div className="rl-card-body">
                <div className="rl-list">
                  {recentes.length === 0 && (
                    <div className="rl-empty">Nenhuma ordem de serviço encontrada.</div>
                  )}

                  {recentes.map((os) => (
                    <Link key={os.id} href={`/os/${os.id}`} className="rl-list-item">
                      <div className="rl-os-row">
                        <div className="rl-os-main">
                          <div className="rl-os-title">
                            O.S #{os.id} • {os.cliente || "Cliente não informado"}
                          </div>

                          <div className="rl-os-meta">
                            Veículo: {os.modelo || "Não informado"}
                            <br />
                            Placa: {os.placa || "-"}
                            <br />
                            Criada em:{" "}
                            {os.criado_em
                              ? new Date(os.criado_em).toLocaleString("pt-BR")
                              : "-"}
                          </div>
                        </div>

                        <div>
                          <StatusBadge status={os.status} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}