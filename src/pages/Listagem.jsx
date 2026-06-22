import { BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { RecipeCard } from "../components/RecipeCard";
import { useAuth } from "../contexts/AuthContext";
import { useReceitas } from "../contexts/RecipeContext";

export function Listagem() {
  const { usuario } = useAuth();
  const { todasReceitas, carregandoReceitas, erroReceitas } = useReceitas();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [tagAtiva, setTagAtiva] = useState("Todas");
  const [visibilidade, setVisibilidade] = useState("Todas");
  const [somenteFavoritas, setSomenteFavoritas] = useState(false);

  const categoriasDisponiveis = useMemo(
    () => ["Todas", ...new Set(todasReceitas.map((receita) => receita.categoria))],
    [todasReceitas],
  );
  const tagsDisponiveis = useMemo(
    () => ["Todas", ...new Set(todasReceitas.flatMap((receita) => receita.tags || []))],
    [todasReceitas],
  );

  const receitasFiltradas = todasReceitas.filter((receita) => {
    const textoBusca = `${receita.nome} ${(receita.tags || []).join(" ")}`.toLowerCase();
    return textoBusca.includes(busca.toLowerCase())
      && (categoria === "Todas" || receita.categoria === categoria)
      && (tagAtiva === "Todas" || (receita.tags || []).includes(tagAtiva))
      && (visibilidade === "Todas" || receita.privacidade === visibilidade)
      && (!somenteFavoritas || receita.favorito);
  });

  return (
    <section className="listing-page">
      <div className="page-title inline">
        <div>
          <span className="eyebrow">
            <BookOpen size={17} />
            Arquivo metodico de {usuario.nome}
          </span>
          <h1>Receitas do bau</h1>
          <p>Busque por nome, categoria, tags, privacidade e receitas favoritas.</p>
        </div>
      </div>

      <div className="filters">
        <label className="search-field">
          <Search size={18} />
          <input value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar por nome ou tag" />
        </label>
        <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
          {categoriasDisponiveis.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={tagAtiva} onChange={(evento) => setTagAtiva(evento.target.value)}>
          {tagsDisponiveis.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={visibilidade} onChange={(evento) => setVisibilidade(evento.target.value)}>
          <option value="Todas">Todas</option>
          <option value="privada">Privadas</option>
          <option value="publica">Publicas</option>
        </select>
        <label className="toggle">
          <input type="checkbox" checked={somenteFavoritas} onChange={(evento) => setSomenteFavoritas(evento.target.checked)} />
          <span>Favoritas</span>
        </label>
      </div>

      {carregandoReceitas && <p className="status">Carregando receitas do banco...</p>}
      {erroReceitas && <p className="status error">{erroReceitas}</p>}

      <div className="recipe-grid">
        {receitasFiltradas.map((receita) => <RecipeCard key={receita.id} receita={receita} />)}
      </div>

      {!carregandoReceitas && !receitasFiltradas.length && (
        <p className="status">Nenhuma receita encontrada com esses filtros.</p>
      )}
    </section>
  );
}
