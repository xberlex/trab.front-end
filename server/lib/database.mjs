import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { DATABASE_PATH } from "../config.mjs";

function normalizarBanco(dados) {
  return {
    receitas: Array.isArray(dados?.receitas) ? dados.receitas : [],
    usuariosInicializados: Array.isArray(dados?.usuariosInicializados)
      ? dados.usuariosInicializados
      : [],
  };
}

export async function lerBanco() {
  try {
    const conteudo = await readFile(DATABASE_PATH, "utf8");
    return normalizarBanco(JSON.parse(conteudo));
  } catch (erro) {
    if (erro.code !== "ENOENT") {
      console.warn("Banco local reiniciado por erro de leitura:", erro.message);
    }

    return normalizarBanco({});
  }
}

export async function salvarBanco(banco) {
  await mkdir(dirname(DATABASE_PATH), { recursive: true });
  await writeFile(DATABASE_PATH, JSON.stringify(normalizarBanco(banco), null, 2));
}
