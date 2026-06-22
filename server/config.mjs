import { resolve } from "node:path";

export const PORT = Number(process.env.PORT) || 3333;
export const DATABASE_PATH =
  process.env.DATABASE_PATH || resolve("server", "database", "receitas.json");
export const DEFAULT_RECIPE_IMAGE =
  process.env.DEFAULT_RECIPE_IMAGE ||
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=900&q=80";
