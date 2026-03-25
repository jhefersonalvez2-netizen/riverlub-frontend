"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import StatusBadge from "../../../../components/StatusBadge";

const API = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "x-api-key": API_KEY } : {}),
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

export default function ClienteOrcamentoPage() {
  const { token } = useParams();

  const [orcamento, setOrcamento] = useState(null);
  const [itens, setItens] = useState([]);
  const [interacoes, setInteracoes] = useState([]);
  const [mensagem, setMensagem] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarOrcamento() {
    try {
      setErro("");
      setLoading(true);

      const data = await apiFetch(`${API}/os/publico/orcamento/${token}`);

      if (data.sucesso) {
        setOrcamento(data.orcamento || null);
        setItens(data.itens || []);
        setInteracoes(data.interacoes || []);
      }
    } catch (err) {
      console.error(err);
      setErro("Não foi possível carregar o orçamento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      carregarOrcamento();
    }
  }, [token]);

  async function aprovar() {
    const confirmar = confirm("Deseja aprovar este orçamento?");
    if (!confirmar) return;

    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/publico/orcamento/${token}/aprovar`, {
        method: "POST",
      });

      if (data.sucesso) {
        alert("Orçamento aprovado com sucesso.");
        await carregarOrcamento();
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao aprovar orçamento.");
    }

    setLoadingAcao(false);
  }

  async function rejeitar() {
    const confirmar = confirm("Deseja rejeitar este orçamento?");
    if (!confirmar) return;

    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/publico/orcamento/${token}/rejeitar`, {
        method: "POST",
      });

      if (data.sucesso) {
        alert("Orçamento rejeitado.");
        await carregarOrcamento();
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao rejeitar orçamento.");
    }

    setLoadingAcao(false);
  }

  async function solicitarAlteracao() {
    if (!mensagem.trim()) {
      alert("Descreva a alteração desejada.");
      return;
    }

    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/publico/orcamento/${token}/alteracao`, {
        method: "POST",
        body: JSON.stringify({
          mensagem,
        }),
      });

      if (data.sucesso) {
        alert("Solicitação enviada com sucesso.");
        setMensagem("");
        await carregarOrcamento();
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao solicitar alteração.");
    }

    setLoadingAcao(false);
  }

  const total = useMemo(() => {
    if (!orcamento) return 0;
    return Number(orcamento.valor_total || 0);
  }, [orcamento]);

  const orcamentoRespondido =
    orcamento?.status === "APROVADO" || orcamento?.status === "REJEITADO";

  if (loading) {
    return (
      <div className="rl-auth-shell" style={{ padding: 24 }}>
        <div className="rl-auth-card">
          <div className="rl-auth-title">Carregando orçamento...</div>
        </div>
      </div>
    );
  }

  if (erro || !orcamento) {
    return (
      <div className="rl-auth-shell" style={{ padding: 24 }}>
        <div className="rl-auth-card">
          <div className="rl-alert rl-alert-danger">
            {erro || "Orçamento não encontrado."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rl-auth-shell"
      style={{
        padding: 24,
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 28%), linear-gradient(180deg, #011552 0%, #08246f 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          background: "#fff",
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
            padding: 28,
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <img
              src="/icon-512.png"
              alt="RiverLub"
              style={{
                width: 150,
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, opacity: 0.85 }}>Canal do cliente</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
              Orçamento da O.S #{orcamento.os_id}
            </div>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 22,
            }}
          >
            <div>
              <div className="rl-page-title" style={{ fontSize: 26 }}>
                Olá, {orcamento.cliente || "cliente"}
              </div>
              <div className="rl-page-subtitle">
                Sua oficina enviou este orçamento para análise. Revise os itens abaixo e escolha como deseja continuar.
              </div>
            </div>

            <StatusBadge status={orcamento.status} />
          </div>

          {orcamento.status === "APROVADO" && (
            <div className="rl-alert rl-alert-success" style={{ marginBottom: 18 }}>
              Você já aprovou este orçamento. A oficina pode seguir com a execução do serviço.
            </div>
          )}

          {orcamento.status === "REJEITADO" && (
            <div className="rl-alert rl-alert-danger" style={{ marginBottom: 18 }}>
              Este orçamento foi rejeitado. Se precisar, você ainda pode registrar uma solicitação de alteração abaixo.
            </div>
          )}

          {orcamento.status === "PENDENTE" && (
            <div className="rl-alert rl-alert-info" style={{ marginBottom: 18 }}>
              Este orçamento está aguardando sua resposta.
            </div>
          )}

          <section className="rl-grid cols-2">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Cliente</div>
              </div>
              <div className="rl-card-body">
                <div className="rl-data-grid">
                  <div className="rl-data-item">
                    <div className="rl-data-label">Nome</div>
                    <div className="rl-data-value">{orcamento.cliente || "-"}</div>
                  </div>

                  <div className="rl-data-item">
                    <div className="rl-data-label">Telefone</div>
                    <div className="rl-data-value">{orcamento.telefone || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Veículo</div>
              </div>
              <div className="rl-card-body">
                <div className="rl-data-grid">
                  <div className="rl-data-item">
                    <div className="rl-data-label">Placa</div>
                    <div className="rl-data-value">{orcamento.placa || "-"}</div>
                  </div>

                  <div className="rl-data-item">
                    <div className="rl-data-label">Marca</div>
                    <div className="rl-data-value">{orcamento.marca || "-"}</div>
                  </div>

                  <div className="rl-data-item">
                    <div className="rl-data-label">Modelo</div>
                    <div className="rl-data-value">{orcamento.modelo || "-"}</div>
                  </div>

                  <div className="rl-data-item">
                    <div className="rl-data-label">Ano</div>
                    <div className="rl-data-value">{orcamento.ano || "-"}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rl-section">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Itens do orçamento</div>
                <div className="rl-card-subtitle">
                  Versão {orcamento.versao} • criada em{" "}
                  {orcamento.criado_em
                    ? new Date(orcamento.criado_em).toLocaleString("pt-BR")
                    : "-"}
                </div>
              </div>

              <div className="rl-card-body">
                <div className="rl-list">
                  {itens.length === 0 && (
                    <div className="rl-empty">Nenhum item encontrado neste orçamento.</div>
                  )}

                  {itens.map((item) => (
                    <div key={item.id} className="rl-list-item">
                      <div className="rl-os-title">{item.descricao}</div>
                      <div className="rl-os-meta">
                        Tipo: {item.tipo || "-"}
                        <br />
                        Quantidade: {Number(item.quantidade || 0)}
                        <br />
                        Valor unitário: R$ {Number(item.valor_unitario || 0).toFixed(2)}
                        <br />
                        Valor total: R$ {Number(item.valor_total || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 18,
                    padding: 18,
                    borderRadius: 16,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="rl-kpi-label">Total do orçamento</div>
                  <div className="rl-kpi-value" style={{ marginTop: 8 }}>
                    R$ {total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rl-section">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Sua resposta</div>
                <div className="rl-card-subtitle">
                  Escolha uma das opções abaixo para continuar o atendimento.
                </div>
              </div>

              <div className="rl-card-body">
                <div className="rl-inline">
                  <button
                    className="rl-btn rl-btn-success"
                    disabled={loadingAcao || orcamentoRespondido}
                    onClick={aprovar}
                  >
                    Aprovar orçamento
                  </button>

                  <button
                    className="rl-btn rl-btn-danger"
                    disabled={loadingAcao || orcamentoRespondido}
                    onClick={rejeitar}
                  >
                    Rejeitar orçamento
                  </button>
                </div>

                <div style={{ marginTop: 18 }}>
                  <label className="rl-label">Solicitar alteração</label>
                  <textarea
                    className="rl-textarea"
                    placeholder="Descreva a alteração desejada. Ex: retirar item, revisar valor, trocar marca da peça..."
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                </div>

                <div style={{ marginTop: 14 }}>
                  <button
                    className="rl-btn rl-btn-secondary"
                    disabled={loadingAcao || !mensagem.trim()}
                    onClick={solicitarAlteracao}
                  >
                    Enviar solicitação de alteração
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rl-section">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Histórico do atendimento</div>
                <div className="rl-card-subtitle">
                  Registro das suas respostas e interações neste orçamento.
                </div>
              </div>

              <div className="rl-card-body">
                {interacoes.length === 0 ? (
                  <div className="rl-empty">Nenhuma interação registrada ainda.</div>
                ) : (
                  interacoes.map((item) => (
                    <div key={item.id} className="rl-history-item">
                      <div style={{ fontWeight: 800 }}>{item.tipo}</div>
                      {item.mensagem && (
                        <div className="rl-os-meta" style={{ marginTop: 6 }}>
                          {item.mensagem}
                        </div>
                      )}
                      <div className="rl-muted" style={{ marginTop: 4, fontSize: 14 }}>
                        {item.criado_em
                          ? new Date(item.criado_em).toLocaleString("pt-BR")
                          : "-"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}