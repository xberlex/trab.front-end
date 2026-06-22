const env = import.meta.env;

export const APP_NAME = env.VITE_APP_NAME || "Bau do Chef";
export const STORAGE_PREFIX = env.VITE_STORAGE_PREFIX || "bau-do-chef";
export const SESSION_KEY = `${STORAGE_PREFIX}-sessao`;
export const LEGACY_RECIPES_KEY = `${STORAGE_PREFIX}-receitas`;
export const API_BASE_URL = env.VITE_API_BASE_URL || "http://localhost:3333";
export const DEFAULT_RECIPE_IMAGE =
  env.VITE_DEFAULT_RECIPE_IMAGE ||
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=900&q=80";
