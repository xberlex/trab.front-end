import { BookOpen, Eye, EyeOff, Heart, Lock, Scale, Trash2, Unlock } from "lucide-react";
import { useState } from "react";
import { useReceitas } from "../contexts/RecipeContext";
import { recalcularIngredientes, resumir } from "../utils/recipes";

export function RecipeCard({ receita, compact = false }) {
  const { removerReceita, alternarFavorito } = useReceitas();
  const [aberta, setAberta] = useState(false);
  const [porcoes, setPorcoes] = useState(receita.porcoesBase || 4);
  const podeEditar = receita.origem === "Bau pessoal";
  const privada = receita.privacidade === "privada";

  return (
    <article className={`recipe-card ${compact ? "is-compact" : ""}`}>
      <img src={receita.imagem} alt={receita.nome} />
      <div className="recipe-content">
        <div className="card-topline">
          <span>{receita.categoria}</span>
          <small className={privada ? "privacy private" : "privacy public"}>
            {privada ? <Lock size={13} /> : <Unlock size={13} />}
            {privada ? "Privada" : "Publica"}
          </small>
        </div>
        <h3>{receita.nome}</h3>
        <div className="tag-row">
          {(receita.tags || []).slice(0, compact ? 2 : 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        {!compact && (
          <>
            <p>{resumir(receita.ingredientes, aberta ? 240 : 92)}</p>
            {aberta && (
              <div className="details-stack">
                <div className="portion-tool">
                  <label>
                    <Scale size={16} />
                    Porções desejadas
                    <input
                      type="number"
                      min="1"
                      value={porcoes}
                      onChange={(evento) => setPorcoes(evento.target.value)}
                    />
                  </label>
                  <small>Base original: {receita.porcoesBase || 4} porções</small>
                </div>
                <div className="preparation">
                  <strong>Ingredientes recalculados</strong>
                  <p>{recalcularIngredientes(receita.ingredientes, receita.porcoesBase || 4, Number(porcoes) || 1)}</p>
                </div>
                <div className="preparation">
                  <strong>Modo de preparo</strong>
                  <p>{receita.modoPreparo}</p>
                </div>
                <div className="preparation tasting-notes">
                  <strong>Notas de degustacao</strong>
                  <p>{receita.notas || "Nenhum teste registrado ainda."}</p>
                </div>
              </div>
            )}
            <div className="card-actions">
              <button className="icon-text-button" onClick={() => setAberta((valor) => !valor)}>
                {aberta ? <EyeOff size={17} /> : <Eye size={17} />}
                {aberta ? "Fechar" : "Ver detalhes"}
              </button>
              {podeEditar && (
                <button
                  className={`icon-button ${receita.favorito ? "active" : ""}`}
                  onClick={() => alternarFavorito(receita.id)}
                  title="Favoritar"
                  aria-label="Favoritar"
                >
                  <Heart size={18} />
                </button>
              )}
              {podeEditar && (
                <button
                  className="icon-button danger"
                  onClick={() => removerReceita(receita.id)}
                  title="Excluir receita"
                  aria-label="Excluir receita"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}