import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config/app";
import { carregarReceitasUsuario } from "../utils/storage";

const RecipeContext = createContext(null);

function montarUrlReceitas(usuario) {
  const parametros = new URLSearchParams({
    usuario: usuario.id,
    dono: usuario.nome,
  });

  return `${API_BASE_URL}/receitas?${parametros.toString()}`;
}

async function lerResposta(resposta) {
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || "Nao foi possivel acessar o banco de receitas.");
  }

  return dados;
}

export function RecipeProvider({ children, usuario }) {
  const [receitas, setReceitas] = useState([]);
  const [carregandoReceitas, setCarregandoReceitas] = useState(true);
  const [erroReceitas, setErroReceitas] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarReceitas() {
      try {
        setCarregandoReceitas(true);
        setErroReceitas("");

        const resposta = await fetch(montarUrlReceitas(usuario));
        const dados = await lerResposta(resposta);

        if (ativo) setReceitas(dados.receitas || []);
      } catch (erro) {
        if (ativo) {
          setReceitas(carregarReceitasUsuario(usuario));
          setErroReceitas(`${erro.message} Exibindo copia local temporaria.`);
        }
      } finally {
        if (ativo) setCarregandoReceitas(false);
      }
    }

    carregarReceitas();

    return () => {
      ativo = false;
    };
  }, [usuario]);

  async function adicionarReceita(novaReceita) {
    setErroReceitas("");

    const payload = {
      ...novaReceita,
      usuarioId: usuario.id,
      dono: usuario.nome,
      origem: "Bau pessoal",
      favorito: false,
      porcoesBase: Number(novaReceita.porcoesBase) || 1,
      imagem: novaReceita.imagem || "",
    };

    const resposta = await fetch(`${API_BASE_URL}/receitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const dados = await lerResposta(resposta);

    setReceitas((atuais) => [dados.receita, ...atuais]);
    return dados.receita;
  }

  async function removerReceita(id) {
    const anteriores = receitas;
    setReceitas((atuais) => atuais.filter((receita) => receita.id !== id));

    try {
      const resposta = await fetch(`${API_BASE_URL}/receitas/${id}?usuario=${encodeURIComponent(usuario.id)}`, {
        method: "DELETE",
      });
      await lerResposta(resposta);
    } catch (erro) {
      setReceitas(anteriores);
      setErroReceitas(erro.message);
    }
  }

  async function alternarFavorito(id) {
    const receitaAtual = receitas.find((receita) => receita.id === id);
    if (!receitaAtual) return;

    const favorito = !receitaAtual.favorito;
    const anteriores = receitas;
    setReceitas((atuais) =>
      atuais.map((receita) => (receita.id === id ? { ...receita, favorito } : receita)),
    );

    try {
      const resposta = await fetch(`${API_BASE_URL}/receitas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, favorito }),
      });
      const dados = await lerResposta(resposta);

      setReceitas((atuais) =>
        atuais.map((receita) => (receita.id === id ? dados.receita : receita)),
      );
    } catch (erro) {
      setReceitas(anteriores);
      setErroReceitas(erro.message);
    }
  }

  const todasReceitas = useMemo(() => receitas, [receitas]);

  return (
    <RecipeContext.Provider
      value={{
        receitas,
        receitasApi: [],
        todasReceitas,
        carregandoApi: carregandoReceitas,
        erroApi: erroReceitas,
        carregandoReceitas,
        erroReceitas,
        adicionarReceita,
        removerReceita,
        alternarFavorito,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useReceitas() {
  const contexto = useContext(RecipeContext);
  if (!contexto) throw new Error("useReceitas deve ser usado dentro de RecipeProvider.");
  return contexto;
}
