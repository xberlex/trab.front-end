import { createContext, useContext, useState } from "react";
import { SESSION_KEY } from "../config/app";
import { criarIdUsuario } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const sessao = localStorage.getItem(SESSION_KEY);
    return sessao ? JSON.parse(sessao) : null;
  });

  function entrar(nome) {
    const nomeLimpo = nome.trim();
    const conta = { id: criarIdUsuario(nomeLimpo), nome: nomeLimpo };
    localStorage.setItem(SESSION_KEY, JSON.stringify(conta));
    setUsuario(conta);
  }

  function sair() {
    localStorage.removeItem(SESSION_KEY);
    setUsuario(null);
  }

  return <AuthContext.Provider value={{ usuario, entrar, sair }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return contexto;
}