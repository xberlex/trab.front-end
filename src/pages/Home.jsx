import { BookOpen, Calculator, Database, Lock, PlusCircle, Sparkles, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Feature } from "../components/Feature";
import { RecipeCard } from "../components/RecipeCard";
import { Stat } from "../components/Stat";
import { APP_NAME } from "../config/app";
import { useAuth } from "../contexts/AuthContext";
import { useReceitas } from "../contexts/RecipeContext";

export function Home() {
  const { usuario } = useAuth();
  const { receitas, carregandoReceitas, erroReceitas } = useReceitas();
  const navigate = useNavigate();
  const favoritas = receitas.filter((receita) => receita.favorito).length;
  const privadas = receitas.filter((receita) => receita.privacidade === "privada").length;
  const destaques = receitas.slice(0, 4);

  return (
    <section className="home-page">
      <div className="hero treasure-scene">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={17} />
            Bau culinario privado
          </span>
          <h1>{APP_NAME}</h1>
          <p>
            Bem-vindo, {usuario.nome}. Abra seu bau para guardar tecnicas, testes,
            ingredientes e segredos de preparo com organizacao de chef.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate("/cadastro")}>
              <PlusCircle size={19} />
              Guardar receita
            </button>
            <button className="secondary-button" onClick={() => navigate("/receitas")}>
              <BookOpen size={19} />
              Abrir o bau
            </button>
          </div>
        </div>
        <div className="hero-panel chest-panel" aria-label="Resumo do app">
          <span className="metal-label">Conteudo do bau</span>
          <Stat label="Receitas no banco" value={receitas.length} />
          <Stat label="Trancadas" value={privadas} />
          <Stat label="Favoritas" value={favoritas} />
        </div>
      </div>

      <div className="concept-band">
        <Feature icon={<Tag size={20} />} title="Etiquetas do bau" text="Classifique por tecnica, dieta, equipamento e dificuldade." />
        <Feature icon={<Lock size={20} />} title="Fechadura" text="Marque receitas como privadas ou publicas para compartilhar." />
        <Feature icon={<Calculator size={20} />} title="Balanca do chef" text="Recalcule ingredientes com base no rendimento desejado." />
      </div>

      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <Database size={17} />
            Banco de receitas
          </span>
          <h2>Destaques guardados no bau</h2>
        </div>
        <button className="text-button" onClick={() => navigate("/receitas")}>
          Ver todas
        </button>
      </div>

      {carregandoReceitas && <p className="status">Carregando receitas do banco...</p>}
      {erroReceitas && <p className="status error">{erroReceitas}</p>}
      <div className="recipe-grid compact">
        {destaques.map((receita) => (
          <RecipeCard key={receita.id} receita={receita} compact />
        ))}
      </div>
      {!carregandoReceitas && !destaques.length && (
        <p className="status">Nenhuma receita guardada ainda. Cadastre a primeira receita do bau.</p>
      )}
    </section>
  );
}
