"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AppSidebar from "../../../components/AppSidebar";
import StatusBadge from "../../../components/StatusBadge";

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
    const erro = new Error(data.erro || "Erro na requisição");
    erro.detalhe = data.detalhe || null;
    throw erro;
  }

  return data;
}

export default function OSPage() {
  const { id } = useParams();

  const [os, setOS] = useState(null);
  const [itens, setItens] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [logs, setLogs] = useState([]);
  const [arvore, setArvore] = useState(null);
  const [interacoesCliente, setInteracoesCliente] = useState([]);

  const [catalogoExterno, setCatalogoExterno] = useState([]);
  const [loadingCatalogoExterno, setLoadingCatalogoExterno] = useState(false);

  const [vinculacaoCatalogo, setVinculacaoCatalogo] = useState(null);
  const [loadingVinculacao, setLoadingVinculacao] = useState(false);

  const [candidatosCatalogo, setCandidatosCatalogo] = useState([]);
  const [loadingCandidatos, setLoadingCandidatos] = useState(false);
  const [buscaCatalogoExecutada, setBuscaCatalogoExecutada] = useState(false);

  const [abertoSistema, setAbertoSistema] = useState({});
  const [abertoSub, setAbertoSub] = useState({});
  const [selecionados, setSelecionados] = useState([]);

  const [loadingPagina, setLoadingPagina] = useState(true);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarOS() {
    const data = await apiFetch(`${API}/os/${id}`);
    if (data.sucesso) setOS(data.os);
  }

  async function carregarItens() {
    const data = await apiFetch(`${API}/os/${id}/itens`);
    if (data.sucesso) setItens(data.itens || []);
  }

  async function carregarCatalogo() {
    const data = await apiFetch(`${API}/servicos`);
    if (data.sucesso) setCatalogo(data.servicos || []);
  }

  async function carregarOrcamentos() {
    const data = await apiFetch(`${API}/os/${id}/orcamentos`);
    if (data.sucesso) setOrcamentos(data.orcamentos || []);
  }

  async function carregarLogs() {
    const data = await apiFetch(`${API}/os/${id}/logs`);
    if (data.sucesso) setLogs(data.logs || []);
  }

  async function carregarInteracoesCliente() {
    try {
      const todas = [];

      for (const orc of orcamentos) {
        if (!orc.cliente_token) continue;

        const data = await apiFetch(`${API}/os/publico/orcamento/${orc.cliente_token}`);
        if (data.sucesso && Array.isArray(data.interacoes)) {
          todas.push(...data.interacoes);
        }
      }

      todas.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
      setInteracoesCliente(todas);
    } catch (e) {
      console.error("Erro ao carregar interações do cliente:", e);
    }
  }

  async function carregarTudo() {
    try {
      setErro("");
      setLoadingPagina(true);

      await Promise.all([
        carregarOS(),
        carregarItens(),
        carregarCatalogo(),
        carregarOrcamentos(),
        carregarLogs(),
      ]);
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar dados da OS.");
    } finally {
      setLoadingPagina(false);
    }
  }

  async function alterarStatusOS(novoStatus, mensagemSucesso = "Status alterado") {
    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: novoStatus,
        }),
      });

      if (data.sucesso) {
        alert(mensagemSucesso);
        await carregarOS();
        await carregarLogs();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao alterar status da OS");
    }

    setLoadingAcao(false);
  }

  async function gerarArvoreIA() {
    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/${id}/arvore`);
      if (data.sucesso) {
        setArvore(data.arvore);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar diagnóstico IA");
    }

    setLoadingAcao(false);
  }

  async function gerarOrcamento() {
    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/${id}/orcamentos`, {
        method: "POST",
      });

      if (data.sucesso) {
        alert(`Orçamento versão ${data.orcamento.versao} gerado com sucesso`);
        await carregarOS();
        await carregarOrcamentos();
        await carregarLogs();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar orçamento");
    }

    setLoadingAcao(false);
  }

  async function finalizarOS() {
    await alterarStatusOS("FINALIZADA", "OS finalizada");
  }

  async function reabrirOS() {
    await alterarStatusOS("ABERTA", "OS reaberta");
  }

  async function buscarCandidatosCatalogo() {
    setLoadingCandidatos(true);
    setBuscaCatalogoExecutada(true);
    setCandidatosCatalogo([]);

    try {
      const data = await apiFetch(`${API}/os/${id}/candidatos-catalogo`);

      if (data.sucesso) {
        setCandidatosCatalogo(data.candidatos || []);

        if (!data.candidatos || data.candidatos.length === 0) {
          alert("Nenhum candidato encontrado para este veículo.");
        }
      }
    } catch (e) {
      console.error("Erro ao buscar candidatos:", e);
      alert("Erro ao buscar candidatos no catálogo externo");
    }

    setLoadingCandidatos(false);
  }

  async function selecionarCandidatoCatalogo(candidato) {
    setLoadingVinculacao(true);

    try {
      const data = await apiFetch(`${API}/os/${id}/selecionar-catalogo`, {
        method: "POST",
        body: JSON.stringify({
          catalog_vehicle_id: candidato.catalog_vehicle_id,
          catalog_model_id: candidato.catalog_model_id,
          catalog_type_id: candidato.catalog_type_id,
          catalog_lang_id: candidato.catalog_lang_id,
          catalog_country_filter_id: candidato.catalog_country_filter_id,
        }),
      });

      if (data.sucesso) {
        setVinculacaoCatalogo(data.vinculacao);
        setCandidatosCatalogo([]);
        alert("Veículo vinculado ao catálogo externo");
        await carregarLogs();
      }
    } catch (e) {
      console.error("Erro ao selecionar candidato:", e);
      alert("Erro ao salvar seleção do catálogo");
    }

    setLoadingVinculacao(false);
  }

  function toggleSistema(nome) {
    setAbertoSistema((prev) => ({
      ...prev,
      [nome]: !prev[nome],
    }));
  }

  function toggleSub(sistema, sub) {
    const chave = `${sistema}_${sub}`;
    setAbertoSub((prev) => ({
      ...prev,
      [chave]: !prev[chave],
    }));
  }

  function togglePeca(nome) {
    if (selecionados.includes(nome)) {
      setSelecionados(selecionados.filter((p) => p !== nome));
    } else {
      setSelecionados([...selecionados, nome]);
    }
  }

  async function adicionarSelecionados() {
    if (selecionados.length === 0) return;

    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/${id}/itens/lote`, {
        method: "POST",
        body: JSON.stringify({
          itens: selecionados.map((nome) => ({
            tipo: "peca",
            item_id: null,
            nome,
            quantidade: 1,
            preco_unitario: 0,
          })),
        }),
      });

      if (data.sucesso) {
        setSelecionados([]);
        await carregarItens();
        await carregarLogs();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao adicionar itens");
    }

    setLoadingAcao(false);
  }

  async function removerItem(idItem) {
    const confirmar = confirm("Deseja realmente remover este item?");
    if (!confirmar) return;

    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/itens/${idItem}`, {
        method: "DELETE",
      });

      if (data.sucesso) {
        await carregarItens();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao remover item");
    }

    setLoadingAcao(false);
  }

  async function editarPreco(item) {
    const novo = prompt("Novo preço", item.preco_unitario);
    if (novo === null) return;

    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/itens/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          preco_unitario: novo,
          quantidade: item.quantidade,
        }),
      });

      if (data.sucesso) {
        await carregarItens();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao editar preço");
    }

    setLoadingAcao(false);
  }

  async function alterarQtd(item, novaQtd) {
    if (novaQtd < 1) return;

    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/itens/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          preco_unitario: item.preco_unitario,
          quantidade: novaQtd,
        }),
      });

      if (data.sucesso) {
        await carregarItens();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao alterar quantidade");
    }

    setLoadingAcao(false);
  }

  async function buscarFiltroArCompativel() {
    setLoadingCatalogoExterno(true);

    try {
      const data = await apiFetch(`${API}/catalogo/exemplo-filtro-ar`);

      if (data.sucesso) {
        setCatalogoExterno(data.itens || []);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao buscar catálogo externo");
    }

    setLoadingCatalogoExterno(false);
  }

  async function adicionarItemCatalogoExterno(item) {
    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/${id}/itens`, {
        method: "POST",
        body: JSON.stringify({
          tipo: "peca",
          item_id: item.article_id,
          nome: `${item.nome} - ${item.fabricante} (${item.codigo})`,
          quantidade: 1,
          preco_unitario: 0,
        }),
      });

      if (data.sucesso) {
        alert("Item adicionado na OS");
        await carregarItens();
        await carregarLogs();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao adicionar item do catálogo externo");
    }

    setLoadingAcao(false);
  }

  async function copiarLinkPublico(link) {
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copiado com sucesso.");
    } catch (e) {
      console.error(e);
      alert("Não foi possível copiar o link.");
    }
  }

  useEffect(() => {
    if (id) {
      carregarTudo();
    }
  }, [id]);

  useEffect(() => {
    if (orcamentos.length > 0) {
      carregarInteracoesCliente();
    } else {
      setInteracoesCliente([]);
    }
  }, [orcamentos]);

  const total = useMemo(() => {
    return itens.reduce((acc, i) => {
      const valor = Number(i.preco_total || 0);
      return acc + (Number.isNaN(valor) ? 0 : valor);
    }, 0);
  }, [itens]);

  const totalItens = useMemo(() => itens.length, [itens]);
  const totalOrcamentos = useMemo(() => orcamentos.length, [orcamentos]);

  const ultimaInteracaoCliente = useMemo(() => {
    if (!interacoesCliente.length) return null;
    return interacoesCliente[0];
  }, [interacoesCliente]);

  const acoesFluxo = useMemo(() => {
    if (!os) return [];

    switch (os.status) {
      case "ABERTA":
        return [
          {
            label: "Enviar para fila de espera",
            className: "rl-btn rl-btn-dark",
            action: () => alterarStatusOS("FILA_DE_ESPERA", "Status alterado para FILA_DE_ESPERA"),
          },
          {
            label: "Aguardar aprovação",
            className: "rl-btn rl-btn-warning",
            action: () =>
              alterarStatusOS(
                "AGUARDANDO_APROVACAO",
                "Status alterado para AGUARDANDO_APROVACAO"
              ),
          },
        ];

      case "AGUARDANDO_APROVACAO":
        return [
          {
            label: "Marcar como aberta",
            className: "rl-btn rl-btn-dark",
            action: () => alterarStatusOS("ABERTA", "Status alterado para ABERTA"),
          },
        ];

      case "FILA_DE_ESPERA":
        return [
          {
            label: "Iniciar execução",
            className: "rl-btn rl-btn-primary",
            action: () =>
              alterarStatusOS("EM_EXECUCAO", "Status alterado para EM_EXECUCAO"),
          },
        ];

      case "EM_EXECUCAO":
        return [
          {
            label: "Voltar para fila de espera",
            className: "rl-btn rl-btn-secondary",
            action: () =>
              alterarStatusOS("FILA_DE_ESPERA", "Status alterado para FILA_DE_ESPERA"),
          },
          {
            label: "Finalizar O.S",
            className: "rl-btn rl-btn-success",
            action: finalizarOS,
          },
        ];

      case "FINALIZADA":
        return [
          {
            label: "Reabrir O.S",
            className: "rl-btn rl-btn-secondary",
            action: reabrirOS,
          },
        ];

      default:
        return [];
    }
  }, [os]);

  if (loadingPagina) {
    return (
      <div className="rl-app">
        <div style={{ flex: 1 }}>
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
              Carregando ordem de serviço
            </div>
          </div>
          <main className="rl-main">Carregando OS...</main>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="rl-app">
        <div style={{ flex: 1 }}>
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
          </div>
          <main className="rl-main">
            <div className="rl-alert rl-alert-danger">{erro}</div>
          </main>
        </div>
      </div>
    );
  }

  if (!os) {
    return (
      <div className="rl-app">
        <div style={{ flex: 1 }}>
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
          </div>
          <main className="rl-main">OS não encontrada.</main>
        </div>
      </div>
    );
  }

  return (
    <div className="rl-app">
      <AppSidebar
        active="os"
        subtitle="Ordem de serviço"
        footerTitle="Veículo"
        footerLines={[
          os.modelo || "Modelo não informado",
          `Placa: ${os.placa || "-"}`,
          `Status: ${os.status || "-"}`,
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
            O.S #{os.id}
          </div>
        </div>

        <main className="rl-main">
          <div className="rl-topbar">
            <div>
              <h1 className="rl-page-title">Ordem de Serviço #{os.id}</h1>
              <p className="rl-page-subtitle">
                Gestão completa do atendimento, itens, orçamento, diagnóstico e
                histórico operacional.
              </p>
            </div>

            <div className="rl-topbar-actions">
              <StatusBadge status={os.status} />

              <button
                className="rl-btn rl-btn-success"
                disabled={loadingAcao || os.status === "FINALIZADA"}
                onClick={finalizarOS}
              >
                Finalizar OS
              </button>

              <button
                className="rl-btn rl-btn-secondary"
                disabled={loadingAcao || os.status === "ABERTA"}
                onClick={reabrirOS}
              >
                Reabrir OS
              </button>
            </div>
          </div>

          {ultimaInteracaoCliente && (
            <section className="rl-section">
              <div className="rl-card">
                <div className="rl-card-header">
                  <div className="rl-card-title">Última resposta do cliente</div>
                  <div className="rl-card-subtitle">
                    Acompanhe rapidamente a última ação registrada no canal do cliente.
                  </div>
                </div>

                <div className="rl-card-body">
                  <div className="rl-inline" style={{ marginBottom: 14 }}>
                    <StatusBadge status={ultimaInteracaoCliente.tipo} />
                  </div>

                  {ultimaInteracaoCliente.mensagem && (
                    <div className="rl-alert rl-alert-warning" style={{ marginBottom: 12 }}>
                      {ultimaInteracaoCliente.mensagem}
                    </div>
                  )}

                  <div className="rl-os-meta">
                    Registrado em:{" "}
                    {ultimaInteracaoCliente.criado_em
                      ? new Date(ultimaInteracaoCliente.criado_em).toLocaleString("pt-BR")
                      : "-"}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="rl-section">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Fluxo operacional</div>
                <div className="rl-card-subtitle">
                  A próxima ação da oficina varia conforme o estágio atual da ordem de serviço.
                </div>
              </div>

              <div className="rl-card-body">
                <div className="rl-inline">
                  {acoesFluxo.map((acao) => (
                    <button
                      key={acao.label}
                      className={acao.className}
                      disabled={loadingAcao}
                      onClick={acao.action}
                    >
                      {acao.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rl-grid cols-3" id="resumo">
            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Total atual</div>
              <div className="rl-kpi-value">R$ {total.toFixed(2)}</div>
              <div className="rl-kpi-foot">Soma dos itens registrados</div>
            </div>

            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Itens na OS</div>
              <div className="rl-kpi-value">{totalItens}</div>
              <div className="rl-kpi-foot">Peças e serviços cadastrados</div>
            </div>

            <div className="rl-card rl-kpi">
              <div className="rl-kpi-label">Orçamentos</div>
              <div className="rl-kpi-value">{totalOrcamentos}</div>
              <div className="rl-kpi-foot">Versões geradas até agora</div>
            </div>
          </section>

          <section className="rl-section">
            <div className="rl-grid cols-2">
              <div className="rl-card">
                <div className="rl-card-header">
                  <div className="rl-card-title">Cliente</div>
                  <div className="rl-card-subtitle">
                    Dados principais do atendimento.
                  </div>
                </div>

                <div className="rl-card-body">
                  <div className="rl-data-grid">
                    <div className="rl-data-item">
                      <div className="rl-data-label">Nome</div>
                      <div className="rl-data-value">{os.cliente || "-"}</div>
                    </div>

                    <div className="rl-data-item">
                      <div className="rl-data-label">Telefone</div>
                      <div className="rl-data-value">{os.telefone || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rl-card">
                <div className="rl-card-header">
                  <div className="rl-card-title">Veículo</div>
                  <div className="rl-card-subtitle">
                    Identificação usada na ordem de serviço.
                  </div>
                </div>

                <div className="rl-card-body">
                  <div className="rl-data-grid">
                    <div className="rl-data-item">
                      <div className="rl-data-label">Placa</div>
                      <div className="rl-data-value">{os.placa || "-"}</div>
                    </div>

                    <div className="rl-data-item">
                      <div className="rl-data-label">Marca</div>
                      <div className="rl-data-value">{os.marca || "-"}</div>
                    </div>

                    <div className="rl-data-item">
                      <div className="rl-data-label">Modelo</div>
                      <div className="rl-data-value">{os.modelo || "-"}</div>
                    </div>

                    <div className="rl-data-item">
                      <div className="rl-data-label">Ano</div>
                      <div className="rl-data-value">{os.ano || "-"}</div>
                    </div>

                    <div className="rl-data-item">
                      <div className="rl-data-label">Motor</div>
                      <div className="rl-data-value">{os.motor || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rl-section" id="itens">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Itens da OS</div>
                <div className="rl-card-subtitle">
                  Ajuste quantidades, edite preços e remova itens quando necessário.
                </div>
              </div>

              <div className="rl-card-body">
                {itens.length === 0 && (
                  <div className="rl-empty">Nenhum item adicionado ainda.</div>
                )}

                <div className="rl-list">
                  {itens.map((i) => (
                    <div key={i.id} className="rl-item-card">
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div className="rl-os-title">{i.nome}</div>
                        <div className="rl-os-meta">
                          Quantidade: {i.quantidade}
                          <br />
                          Preço unitário: R$ {Number(i.preco_unitario || 0).toFixed(2)}
                          <br />
                          Total: R$ {Number(i.preco_total || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="rl-item-actions">
                        <button
                          className="rl-small-btn"
                          disabled={loadingAcao}
                          onClick={() => alterarQtd(i, i.quantidade + 1)}
                        >
                          +
                        </button>

                        <button
                          className="rl-small-btn"
                          disabled={loadingAcao}
                          onClick={() => alterarQtd(i, i.quantidade - 1)}
                        >
                          -
                        </button>

                        <button
                          className="rl-small-btn"
                          disabled={loadingAcao}
                          onClick={() => editarPreco(i)}
                        >
                          Editar
                        </button>

                        <button
                          className="rl-small-btn"
                          disabled={loadingAcao}
                          onClick={() => removerItem(i.id)}
                          style={{
                            background: "#fff1f2",
                            color: "#b42318",
                            borderColor: "#fecdd3",
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rl-section" id="catalogo">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Catálogo externo</div>
                <div className="rl-card-subtitle">
                  Busca assistida e vínculo manual do veículo quando necessário.
                </div>
              </div>

              <div className="rl-card-body">
                <div className="rl-inline">
                  <button
                    className="rl-btn rl-btn-secondary"
                    disabled={loadingCandidatos || loadingAcao}
                    onClick={buscarCandidatosCatalogo}
                  >
                    {loadingCandidatos ? "Buscando..." : "Buscar candidatos do catálogo"}
                  </button>

                  <button
                    className="rl-btn rl-btn-primary"
                    disabled={loadingCatalogoExterno || loadingAcao}
                    onClick={buscarFiltroArCompativel}
                  >
                    {loadingCatalogoExterno
                      ? "Buscando..."
                      : "Buscar filtro de ar compatível"}
                  </button>
                </div>

                {buscaCatalogoExecutada &&
                  !loadingCandidatos &&
                  candidatosCatalogo.length === 0 && (
                    <div style={{ marginTop: 14 }} className="rl-alert rl-alert-warning">
                      Nenhum candidato encontrado para este veículo.
                    </div>
                  )}

                {vinculacaoCatalogo && (
                  <div style={{ marginTop: 14 }} className="rl-alert rl-alert-success">
                    <strong>Veículo vinculado com sucesso.</strong>
                    <br />
                    Vehicle ID: {vinculacaoCatalogo.catalog_vehicle_id}
                    <br />
                    Model ID: {vinculacaoCatalogo.catalog_model_id}
                    <br />
                    Type ID: {vinculacaoCatalogo.catalog_type_id}
                  </div>
                )}

                {candidatosCatalogo.length > 0 && (
                  <div style={{ marginTop: 18 }} className="rl-list">
                    {candidatosCatalogo.map((candidato, index) => (
                      <div
                        key={`${candidato.catalog_vehicle_id}-${index}`}
                        className="rl-list-item"
                      >
                        <div className="rl-os-title">{candidato.model_name}</div>
                        <div className="rl-os-meta">
                          Descrição: {candidato.descricao || "Sem descrição"}
                          <br />
                          Ano: {candidato.ano_inicio || "?"} até {candidato.ano_fim || "?"}
                          <br />
                          Motor: {candidato.motor || "Não informado"}
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <button
                            className="rl-btn rl-btn-success"
                            disabled={loadingVinculacao}
                            onClick={() => selecionarCandidatoCatalogo(candidato)}
                          >
                            {loadingVinculacao ? "Salvando..." : "Selecionar este veículo"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {catalogoExterno.length > 0 && (
                  <div style={{ marginTop: 18 }} className="rl-list">
                    {catalogoExterno.map((item) => (
                      <div key={item.article_id} className="rl-list-item">
                        <div
                          style={{
                            display: "flex",
                            gap: 14,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          {item.imagem && (
                            <img
                              src={item.imagem}
                              alt={item.nome}
                              style={{
                                width: 84,
                                height: 84,
                                objectFit: "contain",
                                background: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                padding: 6,
                              }}
                            />
                          )}

                          <div style={{ flex: 1, minWidth: 220 }}>
                            <div className="rl-os-title">{item.nome}</div>
                            <div className="rl-os-meta">
                              Fabricante: {item.fabricante}
                              <br />
                              Código: {item.codigo}
                            </div>
                          </div>

                          <button
                            className="rl-btn rl-btn-success"
                            disabled={loadingAcao}
                            onClick={() => adicionarItemCatalogoExterno(item)}
                          >
                            Adicionar na OS
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {catalogo.length > 0 && (
                  <div style={{ marginTop: 18 }} className="rl-muted">
                    Serviços internos carregados: {catalogo.length}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rl-section" id="orcamentos">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Orçamentos</div>
                <div className="rl-card-subtitle">
                  Gere versões, acompanhe o status e envie para aprovação no canal do cliente.
                </div>
              </div>

              <div className="rl-card-body">
                <div className="rl-inline">
                  <button
                    className="rl-btn rl-btn-primary"
                    disabled={loadingAcao}
                    onClick={gerarOrcamento}
                  >
                    {loadingAcao ? "Processando..." : "Gerar orçamento"}
                  </button>
                </div>

                <div style={{ marginTop: 14 }} className="rl-alert rl-alert-info">
                  A aprovação e a rejeição do orçamento serão feitas na tela externa do cliente.
                </div>

                <div style={{ marginTop: 18 }} className="rl-list">
                  {orcamentos.length === 0 && (
                    <div className="rl-empty">Nenhum orçamento gerado ainda.</div>
                  )}

                  {orcamentos.map((orc) => {
                    const linkPublico = orc.cliente_token
                      ? `${window.location.origin}/cliente/orcamento/${orc.cliente_token}`
                      : null;

                    return (
                      <div key={orc.id} className="rl-list-item">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div className="rl-os-title">Versão {orc.versao}</div>
                            <div className="rl-os-meta">
                              Total: R$ {Number(orc.valor_total || 0).toFixed(2)}
                              <br />
                              Criado em:{" "}
                              {orc.criado_em
                                ? new Date(orc.criado_em).toLocaleString("pt-BR")
                                : "-"}
                              <br />
                              {orc.aprovado_em && (
                                <>
                                  Aprovado em:{" "}
                                  {new Date(orc.aprovado_em).toLocaleString("pt-BR")}
                                  <br />
                                </>
                              )}
                            </div>
                          </div>

                          <StatusBadge status={orc.status} />
                        </div>

                        {linkPublico && (
                          <div
                            style={{
                              marginTop: 14,
                              padding: 14,
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
                              Link público do cliente
                            </div>

                            <div
                              style={{
                                marginTop: 8,
                                wordBreak: "break-all",
                                fontSize: 14,
                                color: "var(--text)",
                              }}
                            >
                              {linkPublico}
                            </div>

                            <div className="rl-inline" style={{ marginTop: 12 }}>
                              <button
                                className="rl-btn rl-btn-secondary"
                                onClick={() => copiarLinkPublico(linkPublico)}
                              >
                                Copiar link
                              </button>

                              <a
                                href={linkPublico}
                                target="_blank"
                                rel="noreferrer"
                                className="rl-btn rl-btn-dark"
                              >
                                Abrir tela do cliente
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="rl-section" id="ia">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Diagnóstico IA</div>
                <div className="rl-card-subtitle">
                  Gere uma árvore técnica e selecione peças para incluir na OS.
                </div>
              </div>

              <div className="rl-card-body">
                <button
                  className="rl-btn rl-btn-primary"
                  disabled={loadingAcao}
                  onClick={gerarArvoreIA}
                >
                  {loadingAcao ? "Carregando..." : "Gerar diagnóstico IA"}
                </button>

                {arvore &&
                  Object.keys(arvore).map((sistema) => (
                    <div key={sistema} className="rl-tree-block">
                      <div
                        className="rl-tree-toggle"
                        onClick={() => toggleSistema(sistema)}
                      >
                        {abertoSistema[sistema] ? "▼" : "▶"} {sistema}
                      </div>

                      {abertoSistema[sistema] &&
                        Object.keys(arvore[sistema]).map((sub) => {
                          const chave = `${sistema}_${sub}`;

                          return (
                            <div key={sub} className="rl-tree-node" style={{ marginLeft: 20 }}>
                              <div
                                className="rl-tree-toggle"
                                onClick={() => toggleSub(sistema, sub)}
                              >
                                {abertoSub[chave] ? "▼" : "▶"} {sub}
                              </div>

                              {abertoSub[chave] &&
                                arvore[sistema][sub].map((peca) => (
                                  <label key={peca} className="rl-checkbox-row">
                                    <input
                                      type="checkbox"
                                      autoComplete="off"
                                      checked={selecionados.includes(peca)}
                                      onChange={() => togglePeca(peca)}
                                    />
                                    {peca}
                                  </label>
                                ))}
                            </div>
                          );
                        })}
                    </div>
                  ))}

                {selecionados.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <button
                      className="rl-btn rl-btn-success"
                      disabled={loadingAcao}
                      onClick={adicionarSelecionados}
                    >
                      {loadingAcao ? "Adicionando..." : "Adicionar peças selecionadas"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rl-section" id="historico">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Histórico da OS</div>
                <div className="rl-card-subtitle">
                  Registro das principais ações executadas no atendimento.
                </div>
              </div>

              <div className="rl-card-body">
                {logs.length === 0 && (
                  <div className="rl-empty">Nenhum log encontrado.</div>
                )}

                {logs.map((log) => (
                  <div key={log.id} className="rl-history-item">
                    <div style={{ fontWeight: 800 }}>{log.evento}</div>
                    <div className="rl-muted" style={{ marginTop: 4, fontSize: 14 }}>
                      {log.criado_em
                        ? new Date(log.criado_em).toLocaleString("pt-BR")
                        : "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
} 