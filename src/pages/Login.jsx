import { ArrowLeft, Lock, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { APP_NAME } from "../config/app";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const { entrar } = useAuth();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [modo, setModo] = useState("login");
  const cadastrando = modo === "cadastro";

  function enviar(evento) {
    evento.preventDefault();
    const identificador = nome.trim();

    if (!identificador) {
      setErro(cadastrando ? "Informe um nome de usuario para criar a conta." : "Informe seu nome para abrir o bau.");
      return;
    }

    if (cadastrando && !/^[a-zA-Z0-9._-]{3,24}$/.test(identificador)) {
      setErro("Use de 3 a 24 caracteres: letras, numeros, ponto, hifen ou sublinhado.");
      return;
    }

    entrar(identificador);
  }

  function alterarModo(novoModo) {
    setModo(novoModo);
    setNome("");
    setErro("");
  }

  return (
    <main className="login-page">
      <section className="login-hero treasure-scene">
        <div className="login-copy">
          <span className="eyebrow">
            <Lock size={14} />
            Acesso ao bau pessoal
          </span>
          <h1>{APP_NAME}</h1>
          <p>
            Entre com seu nome para destrancar seu arquivo culinario. Cada conta guarda receitas,
            favoritos, tags e notas como se fossem segredos de cozinha.
          </p>
        </div>
        <form className="login-form chest-panel" onSubmit={enviar} noValidate>
          <span className="metal-label">Fechadura do chef</span>
          <h2>{cadastrando ? "Criar conta" : "Entrar no bau"}</h2>
          {cadastrando && (
            <p className="login-form-note">Escolha um nome de usuario para identificar seu bau pessoal.</p>
          )}
          <label>
            {cadastrando ? "Nome de usuario" : "Digite seu nome"}
            <input
              value={nome}
              onChange={(evento) => {
                setNome(evento.target.value);
                setErro("");
              }}
              placeholder={cadastrando ? "Ex: Marcos Antonio" : "Ex: Marcos Antonio"}
              autoFocus
            />
          </label>
          {erro && <span className="field-error">{erro}</span>}
          <div className="login-form-actions">
            <button className="primary-button" type="submit">
              {cadastrando ? <UserPlus size={14} /> : <User size={14} />}
              {cadastrando ? "Criar conta" : "Destrancar"}
            </button>
            {!cadastrando && (
              <button className="secondary-button" type="button" onClick={() => alterarModo("cadastro")}>
                <UserPlus size={14} />
                Cadastro
              </button>
            )}
            {cadastrando && (
              <button className="secondary-button" type="button" onClick={() => alterarModo("login")}>
                <ArrowLeft size={14} />
                Voltar ao login
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}