import { LEGACY_RECIPES_KEY, STORAGE_PREFIX } from "../config/app";
import { receitasIniciais } from "../data/initialRecipes";

export function criarIdUsuario(nome) {
  return (
    nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "usuario"
  );
}

export function chaveReceitas(usuario) {
  return `${STORAGE_PREFIX}-receitas:${usuario.id}`;
}

export function carregarReceitasUsuario(usuario) {
  const salvas = localStorage.getItem(chaveReceitas(usuario));
  if (salvas) return JSON.parse(salvas);

  const legado = localStorage.getItem(LEGACY_RECIPES_KEY);
  if (legado) return JSON.parse(legado);

  return receitasIniciais.map((receita) => ({ ...receita, dono: usuario.nome }));
}