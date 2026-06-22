import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import { DEFAULT_RECIPE_IMAGE, PORT } from "./config.mjs";
import { receitasBase } from "./data/receitasBase.mjs";
import { lerBanco, salvarBanco } from "./lib/database.mjs";
import { aplicarCors, enviarJson, lerJson } from "./lib/http.mjs";

const LIMITE_IMAGEM_BASE64 = 4_300_000;

function ordenarRecentes(receitas) {
  return [...receitas].sort((a, b) => new Date(b.criadaEm || 0) - new Date(a.criadaEm || 0));
}

function obterUsuario(url, corpo = {}) {
  const usuarioId = String(corpo.usuarioId || url.searchParams.get("usuario") || "").trim();
  const dono = String(corpo.dono || url.searchParams.get("dono") || usuarioId || "Usuario").trim();

  if (!usuarioId) {
    const erro = new Error("Informe o usuario para acessar as receitas.");
    erro.status = 400;
    throw erro;
  }

  return { usuarioId, dono };
}

function montarReceitaBase(receita, usuario, indice) {
  const agora = new Date().toISOString();

  return {
    ...receita,
    id: `base-${usuario.usuarioId}-${indice + 1}`,
    usuarioId: usuario.usuarioId,
    dono: usuario.dono,
    criadaEm: agora,
    atualizadaEm: agora,
  };
}

function normalizarReceita(corpo, usuario) {
  const nome = String(corpo.nome || "").trim();
  const ingredientes = String(corpo.ingredientes || "").trim();
  const modoPreparo = String(corpo.modoPreparo || "").trim();
  const imagemRecebida = String(corpo.imagem || "").trim();

  if (!nome || !ingredientes || !modoPreparo) {
    const erro = new Error("Nome, ingredientes e modo de preparo sao obrigatorios.");
    erro.status = 400;
    throw erro;
  }

  if (imagemRecebida && !imagemRecebida.startsWith("data:image/png;base64,")) {
    const erro = new Error("A imagem da receita deve ser um arquivo PNG.");
    erro.status = 400;
    throw erro;
  }

  if (imagemRecebida.length > LIMITE_IMAGEM_BASE64) {
    const erro = new Error("A imagem PNG deve ter no maximo 3 MB.");
    erro.status = 400;
    throw erro;
  }

  const agora = new Date().toISOString();

  return {
    id: randomUUID(),
    usuarioId: usuario.usuarioId,
    dono: usuario.dono,
    nome,
    categoria: String(corpo.categoria || "Sem categoria").trim(),
    ingredientes,
    modoPreparo,
    imagem: imagemRecebida || DEFAULT_RECIPE_IMAGE,
    origem: "Bau pessoal",
    favorito: Boolean(corpo.favorito),
    tags: Array.isArray(corpo.tags) ? corpo.tags.map(String).filter(Boolean) : [],
    privacidade: corpo.privacidade === "publica" ? "publica" : "privada",
    porcoesBase: Number(corpo.porcoesBase) > 0 ? Number(corpo.porcoesBase) : 1,
    notas: String(corpo.notas || "").trim(),
    criadaEm: agora,
    atualizadaEm: agora,
  };
}

async function listarReceitas(url) {
  const usuario = obterUsuario(url);
  const banco = await lerBanco();
  const usuarioNovo = !banco.usuariosInicializados.includes(usuario.usuarioId);

  if (usuarioNovo) {
    const iniciais = receitasBase.map((receita, indice) => montarReceitaBase(receita, usuario, indice));
    banco.receitas = [...iniciais, ...banco.receitas];
    banco.usuariosInicializados = [...banco.usuariosInicializados, usuario.usuarioId];
    await salvarBanco(banco);
  }

  return ordenarRecentes(banco.receitas.filter((receita) => receita.usuarioId === usuario.usuarioId));
}

async function criarReceita(url, requisicao) {
  const corpo = await lerJson(requisicao);
  const usuario = obterUsuario(url, corpo);
  const receita = normalizarReceita(corpo, usuario);
  const banco = await lerBanco();

  banco.receitas = [receita, ...banco.receitas];
  if (!banco.usuariosInicializados.includes(usuario.usuarioId)) {
    banco.usuariosInicializados.push(usuario.usuarioId);
  }

  await salvarBanco(banco);
  return receita;
}

async function atualizarReceita(url, id, requisicao) {
  const corpo = await lerJson(requisicao);
  const usuario = obterUsuario(url, corpo);
  const banco = await lerBanco();
  const indice = banco.receitas.findIndex(
    (receita) => receita.id === id && receita.usuarioId === usuario.usuarioId,
  );

  if (indice < 0) {
    const erro = new Error("Receita nao encontrada para este usuario.");
    erro.status = 404;
    throw erro;
  }

  const atual = banco.receitas[indice];
  const atualizada = {
    ...atual,
    favorito: typeof corpo.favorito === "boolean" ? corpo.favorito : atual.favorito,
    privacidade: corpo.privacidade === "publica" || corpo.privacidade === "privada"
      ? corpo.privacidade
      : atual.privacidade,
    notas: typeof corpo.notas === "string" ? corpo.notas.trim() : atual.notas,
    tags: Array.isArray(corpo.tags) ? corpo.tags.map(String).filter(Boolean) : atual.tags,
    atualizadaEm: new Date().toISOString(),
  };

  banco.receitas[indice] = atualizada;
  await salvarBanco(banco);
  return atualizada;
}

async function removerReceita(url, id) {
  const usuario = obterUsuario(url);
  const banco = await lerBanco();
  const tamanhoAnterior = banco.receitas.length;

  banco.receitas = banco.receitas.filter(
    (receita) => !(receita.id === id && receita.usuarioId === usuario.usuarioId),
  );

  if (banco.receitas.length === tamanhoAnterior) {
    const erro = new Error("Receita nao encontrada para este usuario.");
    erro.status = 404;
    throw erro;
  }

  await salvarBanco(banco);
}

const servidor = createServer(async (requisicao, resposta) => {
  aplicarCors(resposta);

  if (requisicao.method === "OPTIONS") {
    resposta.writeHead(204);
    resposta.end();
    return;
  }

  const url = new URL(requisicao.url, `http://${requisicao.headers.host}`);
  const partes = url.pathname.split("/").filter(Boolean);

  try {
    if (requisicao.method === "GET" && url.pathname === "/health") {
      enviarJson(resposta, 200, { status: "ok", servico: "bau-do-chef-api" });
      return;
    }

    if (partes[0] === "receitas" && requisicao.method === "GET") {
      const receitas = await listarReceitas(url);
      enviarJson(resposta, 200, { receitas });
      return;
    }

    if (partes[0] === "receitas" && requisicao.method === "POST") {
      const receita = await criarReceita(url, requisicao);
      enviarJson(resposta, 201, { receita });
      return;
    }

    if (partes[0] === "receitas" && partes[1] && requisicao.method === "PATCH") {
      const receita = await atualizarReceita(url, partes[1], requisicao);
      enviarJson(resposta, 200, { receita });
      return;
    }

    if (partes[0] === "receitas" && partes[1] && requisicao.method === "DELETE") {
      await removerReceita(url, partes[1]);
      enviarJson(resposta, 200, { removida: true });
      return;
    }

    enviarJson(resposta, 404, { erro: "Rota nao encontrada." });
  } catch (erro) {
    enviarJson(resposta, erro.status || 500, { erro: erro.message || "Erro interno." });
  }
});

servidor.listen(PORT, () => {
  console.log(`API Bau do Chef rodando em http://localhost:${PORT}`);
});
