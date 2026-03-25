"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "../../components/AppSidebar";

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

export default function CadastroPage() {
  const router = useRouter();

  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [motor, setMotor] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagemBusca, setMensagemBusca] = useState("");

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

      const osId = data?.os?.id;

      if (!osId) {
        throw new Error("ID da O.S não retornado pela API");
      }

      router.push(`/os/${osId}`);
      return;
    } catch (err) {
      console.error(err);
      setErro("Erro ao criar ordem de serviço.");
    }

    setLoading(false);
  }

  return (
    <div className="rl-app">
      <AppSidebar
        active="cadastro"
        subtitle="Cadastro e abertura de O.S"
        footerTitle="Fluxo da tela"
        footerLines={[
          "Buscar placa",
          "Confirmar cliente",
          "Criar nova O.S",
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
            Cadastro
          </div>
        </div>

        <main className="rl-main">
          <div className="rl-topbar">
            <div>
              <h1 className="rl-page-title">Cadastro</h1>
              <p className="rl-page-subtitle">
                Busque pela placa, confirme os dados do cliente e do veículo e abra
                uma nova ordem de serviço.
              </p>
            </div>
          </div>

          <section className="rl-section">
            <div className="rl-card">
              <div className="rl-card-header">
                <div className="rl-card-title">Nova ordem de serviço</div>
                <div className="rl-card-subtitle">
                  Use a placa para localizar dados existentes e agilizar o atendimento.
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
                      {loading ? "Criando..." : "Criar O.S"}
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
        </main>
      </div>
    </div>
  );
}