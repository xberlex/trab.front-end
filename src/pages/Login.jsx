import { Lock, User } from "lucide-react";
import { useState } from "react";
import { APP_NAME } from "../config/app";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const { entrar } = useAuth();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");

  function enviar(evento) {
    evento.preventDefault();
    if (!nome.trim()) {
      setErro("Informe seu nome para abrir o bau.");
      return;
    }
    entrar(nome);
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
          <h2>Entrar no bau</h2>
          <label>
            Digite seu nome
            <input
              value={nome}
              onChange={(evento) => {
                setNome(evento.target.value);
                setErro("");
              }}
              placeholder="Ex: Marcos Antonio"
              autoFocus
            />
          </label>
          {erro && <span className="field-error">{erro}</span>}
          <button className="primary-button" type="submit">
            <User size={14} />
            Destrancar
          </button>
        </form>
      </section>
    </main>
  );
}