"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...(options.headers || {})
    }
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

export default function OS() {
  const { id } = useParams();

  const [os, setOS] = useState(null);
  const [itens, setItens] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [logs, setLogs] = useState([]);
  const [arvore, setArvore] = useState(null);

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
        carregarLogs()
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
        method: "POST"
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
        method: "PUT"
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
        method: "PUT"
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
        method: "PUT"
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
        method: "PUT"
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

  function toggleSistema(nome) {
    setAbertoSistema((prev) => ({
      ...prev,
      [nome]: !prev[nome]
    }));
  }

  function toggleSub(sistema, sub) {
    const chave = sistema + "_" + sub;
    setAbertoSub((prev) => ({
      ...prev,
      [chave]: !prev[chave]
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
            preco_unitario: 0
          }))
        })
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
        method: "DELETE"
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
          quantidade: item.quantidade
        })
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
          quantidade: novaQtd
        })
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

  useEffect(() => {
    if (id) {
      carregarTudo();
    }
  }, [id]);

  if (loadingPagina) {
    return <div style={{ padding: "40px" }}>Carregando OS...</div>;
  }

  if (erro) {
    return <div style={{ padding: "40px", color: "red" }}>{erro}</div>;
  }

  if (!os) {
    return <div style={{ padding: "40px" }}>OS não encontrada.</div>;
  }

  const total = itens.reduce((acc, i) => {
    const valor = Number(i.preco_total || 0);
    return acc + (Number.isNaN(valor) ? 0 : valor);
  }, 0);

  const statusColor =
    os.status === "FINALIZADA" ? "green" :
    os.status === "ABERTA" ? "orange" :
    "#333";

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", maxWidth: "900px" }}>
      <h1>Ordem de Serviço #{os.id}</h1>

      <div
        style={{
          display: "inline-block",
          padding: "8px 12px",
          background: statusColor,
          color: "white",
          borderRadius: "6px",
          marginBottom: "20px"
        }}
      >
        Status: {os.status}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          disabled={loadingAcao || os.status === "FINALIZADA"}
          onClick={finalizarOS}
          style={{ marginRight: "10px" }}
        >
          Finalizar OS
        </button>

        <button
          disabled={loadingAcao || os.status === "ABERTA"}
          onClick={reabrirOS}
        >
          Reabrir OS
        </button>
      </div>

      <h2>Cliente</h2>
      Nome: {os.cliente}<br />
      Telefone: {os.telefone}

      <h2 style={{ marginTop: "30px" }}>Veículo</h2>
      Placa: {os.placa}<br />
      Marca: {os.marca}<br />
      Modelo: {os.modelo}<br />
      Ano: {os.ano}<br />
      Motor: {os.motor}

      <h2 style={{ marginTop: "40px" }}>Itens da OS</h2>

      {itens.length === 0 && <div>Nenhum item adicionado ainda.</div>}

      {itens.map((i) => (
        <div
          key={i.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <div>
            <b>{i.nome}</b><br />
            Qtd: {i.quantidade}<br />
            Preço: R$ {i.preco_unitario}<br />
            Total: R$ {i.preco_total}
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button disabled={loadingAcao} onClick={() => alterarQtd(i, i.quantidade + 1)}>+</button>
            <button disabled={loadingAcao} onClick={() => alterarQtd(i, i.quantidade - 1)}>-</button>
            <button disabled={loadingAcao} onClick={() => editarPreco(i)}>Editar</button>
            <button
              disabled={loadingAcao}
              onClick={() => removerItem(i.id)}
              style={{ background: "red", color: "white" }}
            >
              X
            </button>
          </div>
        </div>
      ))}

      <h2>Total da OS: R$ {total.toFixed(2)}</h2>

      <h2 style={{ marginTop: "40px" }}>Orçamentos</h2>

      <button disabled={loadingAcao} onClick={gerarOrcamento}>
        {loadingAcao ? "Processando..." : "Gerar orçamento"}
      </button>

      <div style={{ marginTop: "20px" }}>
        {orcamentos.length === 0 && <div>Nenhum orçamento gerado ainda.</div>}

        {orcamentos.map((orc) => (
          <div
            key={orc.id}
            style={{
              border: "1px solid #999",
              padding: "12px",
              marginBottom: "10px"
            }}
          >
            <b>Versão {orc.versao}</b><br />
            Status: {orc.status}<br />
            Total: R$ {Number(orc.valor_total || 0).toFixed(2)}<br />
            Criado em: {new Date(orc.criado_em).toLocaleString("pt-BR")}<br />
            {orc.aprovado_em && (
              <>
                Aprovado em: {new Date(orc.aprovado_em).toLocaleString("pt-BR")}<br />
              </>
            )}

            <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                disabled={loadingAcao || orc.status === "APROVADO"}
                onClick={() => aprovarOrcamento(orc.id)}
              >
                Aprovar
              </button>

              <button
                disabled={loadingAcao || orc.status === "REJEITADO"}
                onClick={() => rejeitarOrcamento(orc.id)}
              >
                Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "50px" }}>Diagnóstico IA</h2>

      <button disabled={loadingAcao} onClick={gerarArvoreIA}>
        {loadingAcao ? "Carregando..." : "Gerar diagnóstico IA"}
      </button>

      {arvore &&
        Object.keys(arvore).map((sistema) => (
          <div key={sistema} style={{ marginTop: "10px" }}>
            <div
              style={{ cursor: "pointer", fontWeight: "bold" }}
              onClick={() => toggleSistema(sistema)}
            >
              {abertoSistema[sistema] ? "▼" : "▶"} {sistema}
            </div>

            {abertoSistema[sistema] &&
              Object.keys(arvore[sistema]).map((sub) => {
                const chave = sistema + "_" + sub;

                return (
                  <div key={sub} style={{ marginLeft: "20px" }}>
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleSub(sistema, sub)}
                    >
                      {abertoSub[chave] ? "▼" : "▶"} {sub}
                    </div>

                    {abertoSub[chave] &&
                      arvore[sistema][sub].map((peca) => (
                        <div key={peca} style={{ marginLeft: "20px" }}>
                          <input
                            type="checkbox"
                            checked={selecionados.includes(peca)}
                            onChange={() => togglePeca(peca)}
                          />{" "}
                          {peca}
                        </div>
                      ))}
                  </div>
                );
              })}
          </div>
        ))}

      {selecionados.length > 0 && (
        <button
          disabled={loadingAcao}
          onClick={adicionarSelecionados}
          style={{ marginTop: "20px" }}
        >
          {loadingAcao ? "Adicionando..." : "Adicionar peças selecionadas"}
        </button>
      )}

      <h2 style={{ marginTop: "50px" }}>Histórico da OS</h2>

      <div style={{ marginTop: "20px" }}>
        {logs.length === 0 && <div>Nenhum log encontrado.</div>}

        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              borderBottom: "1px solid #ddd",
              padding: "10px 0"
            }}
          >
            <b>{log.evento}</b><br />
            <span style={{ color: "#666", fontSize: "14px" }}>
              {new Date(log.criado_em).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}