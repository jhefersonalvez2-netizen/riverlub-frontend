"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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

function getStatusClass(status) {
  if (status === "FINALIZADA") return "rl-badge rl-badge-final";
  if (status === "ABERTA") return "rl-badge rl-badge-open";
  return "rl-badge rl-badge-default";
}

export default function OSPage() {
  const { id } = useParams();

  const [os, setOS] = useState(null);
  const [itens, setItens] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [logs, setLogs] = useState([]);
  const [arvore, setArvore] = useState(null);

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
      setErro("Erro ao carregar dados da OS");
    } finally {
      setLoadingPagina(false);
    }
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
      alert("Erro IA");
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
        await carregarOrcamentos();
        await carregarLogs();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar orçamento");
    }

    setLoadingAcao(false);
  }

  async function aprovarOrcamento(orcamentoId) {
    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/orcamentos/${orcamentoId}/aprovar`, {
        method: "PUT",
      });

      if (data.sucesso) {
        alert("Orçamento aprovado");
        await carregarOrcamentos();
        await carregarLogs();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao aprovar orçamento");
    }

    setLoadingAcao(false);
  }

  async function rejeitarOrcamento(orcamentoId) {
    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/orcamentos/${orcamentoId}/rejeitar`, {
        method: "PUT",
      });

      if (data.sucesso) {
        alert("Orçamento rejeitado");
        await carregarOrcamentos();
        await carregarLogs();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao rejeitar orçamento");
    }

    setLoadingAcao(false);
  }

  async function finalizarOS() {
    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/${id}/finalizar`, {
        method: "PUT",
      });

      if (data.sucesso) {
        alert("OS finalizada");
        await carregarOS();
        await carregarLogs();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao finalizar OS");
    }

    setLoadingAcao(false);
  }

  async function reabrirOS() {
    setLoadingAcao(true);

    try {
      const data = await apiFetch(`${API}/os/${id}/reabrir`, {
        method: "PUT",
      });

      if (data.sucesso) {
        alert("OS reaberta");
        await carregarOS();
        await carregarLogs();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao reabrir OS");
    }

    setLoadingAcao(false);
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

  useEffect(() => {
    if (id) {
      carregarTudo();
    }
  }, [id]);

  const total = useMemo(() => {
    return itens.reduce((acc, i) => {
      const valor = Number(i.preco_total || 0);
      return acc + (Number.isNaN(valor) ? 0 : valor);
    }, 0);
  }, [itens]);

  if (loadingPagina) {
    return (
      <div className="rl-app">
        <div style={{ flex: 1 }}>
          <div className="rl-mobile-top">
            <div className="rl-brand-title">RiverLub</div>
            <div className="rl-brand-subtitle">Carregando OS</div>
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
            <div className="rl-brand-title">RiverLub</div>
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
            <div className="rl-brand-title">RiverLub</div>
          </div>
          <main className="rl-main">OS não encontrada.</main>
        </div>
      </div>
    );
  }

  return (
    <div className="rl-app">
      <aside className="rl-sidebar">
        <div className="rl-brand">
          <div className="rl-brand-title">RiverLub</div>
          <div className="rl-brand-subtitle">Ordem de serviço</div>
        </div>

        <nav className="rl-nav">
          <div className="rl-nav-label">Navegação</div>
          <a className="rl-nav-item" href="/">
            Painel atendente
          </a>
          <a className="rl-nav-item active" href={`/os/${os.id}`}>
            OS #{os.id}
          </a>
          <a className="rl-nav-item" href="#itens">
            Itens
          </a>
          <a className="rl-nav-item" href="#orcamentos">
            Orçamentos
          </a>
          <a className="rl-nav-item" href="#ia">
            Diagnóstico IA
          </a>
          <a className="rl-nav-item" href="#historico">
            Histórico
          </a>
        </nav>

        <div className="rl-sidebar-footer">
          <strong>Veículo</strong>
          <br />
          {os.modelo || "Modelo não informado"}
          <br />
          Placa: {os.placa || "-"}
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="rl-mobile-top">
          <div className="rl-brand-title">RiverLub</div>
          <div className="rl-brand-subtitle">OS #{os.id}</div>
        </div>

        <main className="rl-main">
          <div className="rl-topbar">
            <div>
              <h1 className="rl-page-title">Ordem de Serviço #{os.id}</h1>
              <p className="rl-page-subtitle">
                Gestão completa do atendimento, itens, orçamento e diagnóstico.
              </p>
            </div>

            <div className="rl-topbar-actions">
              <span className={getStatusClass(os.status)}>{os.status}</span>
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

          <section className="rl-grid cols-2">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Cliente</div>
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
          </section>

          <section className="rl-section">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Resumo financeiro</div>
              </div>
              <div className="rl-card-body">
                <div className="rl-kpi-label">Total atual da OS</div>
                <div className="rl-kpi-value">R$ {total.toFixed(2)}</div>
                <div className="rl-kpi-foot">
                  Baseado nos itens atualmente registrados.
                </div>
              </div>
            </div>
          </section>

          <section className="rl-section" id="itens">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Itens da OS</div>
                <div className="rl-card-subtitle">
                  Ajuste quantidades, preços e remova itens quando necessário.
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

          <section className="rl-section">
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
                    <strong>Vinculado com sucesso.</strong>
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
                          Ano: {candidato.ano_inicio || "?"} até{" "}
                          {candidato.ano_fim || "?"}
                          <br />
                          Motor: {candidato.motor || "Não informado"}
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <button
                            className="rl-btn rl-btn-success"
                            disabled={loadingVinculacao}
                            onClick={() => selecionarCandidatoCatalogo(candidato)}
                          >
                            {loadingVinculacao
                              ? "Salvando..."
                              : "Selecionar este veículo"}
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
              </div>
            </div>
          </section>

          <section className="rl-section" id="orcamentos">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Orçamentos</div>
                <div className="rl-card-subtitle">
                  Gere versões, aprove ou rejeite diretamente pela OS.
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

                <div style={{ marginTop: 18 }} className="rl-list">
                  {orcamentos.length === 0 && (
                    <div className="rl-empty">Nenhum orçamento gerado ainda.</div>
                  )}

                  {orcamentos.map((orc) => (
                    <div key={orc.id} className="rl-list-item">
                      <div className="rl-os-title">Versão {orc.versao}</div>
                      <div className="rl-os-meta">
                        Status: {orc.status}
                        <br />
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

                      <div style={{ marginTop: 12 }} className="rl-inline">
                        <button
                          className="rl-btn rl-btn-success"
                          disabled={loadingAcao || orc.status === "APROVADO"}
                          onClick={() => aprovarOrcamento(orc.id)}
                        >
                          Aprovar
                        </button>

                        <button
                          className="rl-btn rl-btn-secondary"
                          disabled={loadingAcao || orc.status === "REJEITADO"}
                          onClick={() => rejeitarOrcamento(orc.id)}
                        >
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
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
                  Registro das principais ações executadas.
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