"use client";

import { useEffect, useState } from "react";

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
      setErro("Erro ao carregar OS");
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
        setMensagemBusca("Erro ao buscar placa");
        setLoadingBusca(false);
        return;
      }

      if (!data.encontrado) {
        limparFormularioMantendoPlaca();
        setMensagemBusca("Placa não encontrada nem no sistema nem na API externa.");
        setLoadingBusca(false);
        return;
      }

      const dados = data.dados;

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
      setMensagemBusca("Erro ao buscar placa");
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
          motor
        })
      });

      if (!data.sucesso) {
        alert(data.erro || "Erro ao criar OS");
        setLoading(false);
        return;
      }

      alert("OS criada ID: " + data.os.id);

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "40px",
        gap: "10px",
        fontFamily: "Arial",
        padding: "20px"
      }}
    >
      <h1>RiverLub - Painel</h1>

      <h3>Criar OS</h3>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        <input
          placeholder="Placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
        />

        <button
          onClick={buscarPlaca}
          disabled={loadingBusca || !placa.trim()}
        >
          {loadingBusca ? "Buscando..." : "Buscar placa"}
        </button>
      </div>

      {mensagemBusca && (
        <div
          style={{
            color:
              mensagemBusca.includes("não encontrada")
                ? "orange"
                : "green",
            marginTop: "4px",
            textAlign: "center",
            maxWidth: "500px"
          }}
        >
          {mensagemBusca}
        </div>
      )}

      <input
        placeholder="Cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />

      <input
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
      />

      <input
        placeholder="Marca"
        value={marca}
        onChange={(e) => setMarca(e.target.value)}
      />

      <input
        placeholder="Modelo"
        value={modelo}
        onChange={(e) => setModelo(e.target.value)}
      />

      <input
        placeholder="Ano"
        value={ano}
        onChange={(e) => setAno(e.target.value)}
      />

      <input
        placeholder="Motor"
        value={motor}
        onChange={(e) => setMotor(e.target.value)}
      />

      <button
        onClick={criarOS}
        disabled={loading}
        style={{ marginTop: "10px" }}
      >
        {loading ? "Criando..." : "Criar OS"}
      </button>

      {erro && (
        <div style={{ color: "red", marginTop: "10px" }}>
          {erro}
        </div>
      )}

      <h2 style={{ marginTop: "40px" }}>Ordens de Serviço</h2>

      <div style={{ width: "500px", maxWidth: "100%" }}>
        {listaOS.map((os) => (
          <a
            key={os.id}
            href={"/os/" + os.id}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px"
              }}
            >
              <b>OS #{os.id}</b>
              <br />
              Cliente: {os.cliente}
              <br />
              Veículo: {os.modelo} - {os.placa}
              <br />
              Status: {os.status}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}