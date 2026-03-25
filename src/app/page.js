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

export default function Home() {
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [motor, setMotor] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [listaOS, setListaOS] = useState([]);
  const [erro, setErro] = useState("");
  const [mensagemBusca, setMensagemBusca] = useState("");

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
    carregarOS();
  }, []);

  function limparFormularioMantendoPlaca() {
    setCliente("");
    setTelefone("");
    setMarca("");
    setModelo("");
    setAno("");
    setMotor("");
  }

  async function buscarPlaca() {
    if (!placa.trim()) {
      alert("Digite uma placa");
      return;
    }

    setLoadingBusca(true);
    setMensagemBusca("");
    setErro("");

    try {
      const data = await apiFetch(`${API}/os/buscar-placa/${placa}`);

      if (!data.sucesso) {
        setMensagemBusca("Erro ao buscar placa.");
        setLoadingBusca(false);
        return;
      }

      if (!data.encontrado) {
        limparFormularioMantendoPlaca();
        setMensagemBusca("Placa não encontrada nem no sistema nem na API externa.");
        setLoadingBusca(false);
        return;
      }

      const dados = data.dados || {};

      setCliente(dados.cliente || "");
      setTelefone(dados.telefone || "");
      setPlaca(dados.placa || placa.toUpperCase());
      setMarca(dados.marca || "");
      setModelo(dados.modelo || "");
      setAno(dados.ano || "");
      setMotor(dados.motor || "");

      if (data.origem === "banco") {
        setMensagemBusca("Placa encontrada no sistema. Dados preenchidos automaticamente.");
      } else if (data.origem === "api_externa") {
        setMensagemBusca("Placa encontrada na API externa. Complete cliente e telefone para criar.");
      } else {
        setMensagemBusca("Dados carregados.");
      }
    } catch (err) {
      console.error(err);
      setMensagemBusca("Erro ao buscar placa.");
    }

    setLoadingBusca(false);
  }

  async function criarOS() {
    if (!cliente || !placa) {
      alert("Cliente e placa são obrigatórios");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const data = await apiFetch(`${API}/os`, {
        method: "POST",
        body: JSON.stringify({
          cliente,
          telefone,
          placa,
          marca,
          modelo,
          ano,
          motor,
        }),
      });

      if (!data.sucesso) {
        alert(data.erro || "Erro ao criar OS");
        setLoading(false);
        return;
      }

      alert(`OS criada com sucesso. ID: ${data.os.id}`);

      setCliente("");
      setTelefone("");
      setPlaca("");
      setMarca("");
      setModelo("");
      setAno("");
      setMotor("");
      setMensagemBusca("");

      await carregarOS();
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com a API");
    }

    setLoading(false);
  }

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

  return (
    <div className="rl-app">
      <aside className="rl-sidebar">
        <div className="rl-brand">
          <div className="rl-brand-title">
            <span className="accent">River</span>Lub
          </div>
          <div className="rl-brand-subtitle">Sistema operacional para oficinas</div>
        </div>

        <nav className="rl-nav">
          <div className="rl-nav-label">Operação</div>

          <a className="rl-nav-item active" href="/">
            Painel atendente
          </a>

          <a className="rl-nav-item" href="#">
            Fila de carros
          </a>

          <a className="rl-nav-item" href="#">
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
          <strong>Status do sistema</strong>
          <br />
          Fluxo principal ativo
          <br />
          IA disponível
          <br />
          Catálogo externo em validação
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="rl-mobile-top">
          <div className="rl-brand-title">
            <span className="accent">River</span>Lub
          </div>
          <div className="rl-brand-subtitle">Painel atendente</div>
        </div>

        <main className="rl-main">
          <div className="rl-topbar">
            <div>
              <h1 className="rl-page-title">Painel atendente</h1>
              <p className="rl-page-subtitle">
                Cadastre veículos, abra ordens de serviço e acompanhe a operação
                da oficina em tempo real.
              </p>
            </div>

            <div className="rl-topbar-actions">
              <button className="rl-btn rl-btn-secondary" onClick={carregarOS}>
                Atualizar painel
              </button>
            </div>
          </div>

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
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Criar nova ordem de serviço</div>
                <div className="rl-card-subtitle">
                  Busque pela placa, confirme os dados do cliente e do veículo e
                  abra uma nova OS com poucos cliques.
                </div>
              </div>

              <div className="rl-card-body">
                <div className="rl-form-grid">
                  <div className="rl-field">
                    <label className="rl-label">Placa</label>
                    <input
                      className="rl-input"
                      placeholder="ABC1D23"
                      value={placa}
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      inputMode="text"
                      onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="rl-field" style={{ justifyContent: "flex-end" }}>
                    <label className="rl-label">Consulta automática</label>
                    <button
                      className="rl-btn rl-btn-secondary"
                      onClick={buscarPlaca}
                      disabled={loadingBusca || !placa.trim()}
                    >
                      {loadingBusca ? "Buscando..." : "Buscar placa"}
                    </button>
                  </div>

                  {mensagemBusca && (
                    <div className="rl-field full">
                      <div
                        className={
                          mensagemBusca.includes("não encontrada")
                            ? "rl-alert rl-alert-warning"
                            : "rl-alert rl-alert-success"
                        }
                      >
                        {mensagemBusca}
                      </div>
                    </div>
                  )}

                  <div className="rl-field">
                    <label className="rl-label">Cliente</label>
                    <input
                      className="rl-input"
                      placeholder="Nome do cliente"
                      value={cliente}
                      autoComplete="off"
                      spellCheck={false}
                      onChange={(e) => setCliente(e.target.value)}
                    />
                  </div>

                  <div className="rl-field">
                    <label className="rl-label">Telefone</label>
                    <input
                      className="rl-input"
                      placeholder="(00)00000-0000"
                      value={telefone}
                      autoComplete="off"
                      inputMode="tel"
                      onChange={(e) => setTelefone(e.target.value)}
                    />
                  </div>

                  <div className="rl-field">
                    <label className="rl-label">Marca</label>
                    <input
                      className="rl-input"
                      placeholder="Marca"
                      value={marca}
                      autoComplete="off"
                      spellCheck={false}
                      onChange={(e) => setMarca(e.target.value)}
                    />
                  </div>

                  <div className="rl-field">
                    <label className="rl-label">Modelo</label>
                    <input
                      className="rl-input"
                      placeholder="Modelo"
                      value={modelo}
                      autoComplete="off"
                      spellCheck={false}
                      onChange={(e) => setModelo(e.target.value)}
                    />
                  </div>

                  <div className="rl-field">
                    <label className="rl-label">Ano</label>
                    <input
                      className="rl-input"
                      placeholder="Ano"
                      value={ano}
                      autoComplete="off"
                      inputMode="numeric"
                      onChange={(e) => setAno(e.target.value)}
                    />
                  </div>

                  <div className="rl-field">
                    <label className="rl-label">Motor</label>
                    <input
                      className="rl-input"
                      placeholder="Motor"
                      value={motor}
                      autoComplete="off"
                      spellCheck={false}
                      onChange={(e) => setMotor(e.target.value)}
                    />
                  </div>

                  <div className="rl-field full">
                    <button
                      className="rl-btn rl-btn-success"
                      onClick={criarOS}
                      disabled={loading}
                    >
                      {loading ? "Criando..." : "Criar OS"}
                    </button>
                  </div>

                  {erro && (
                    <div className="rl-field full">
                      <div className="rl-alert rl-alert-danger">{erro}</div>
                    </div>
                  )}
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
                    <a key={os.id} href={`/os/${os.id}`} className="rl-list-item">
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
                          <span className={getStatusClass(os.status)}>
                            {os.status || "SEM STATUS"}
                          </span>
                        </div>
                      </div>
                    </a>
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