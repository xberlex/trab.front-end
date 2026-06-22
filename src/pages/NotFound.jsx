import { CircleAlert, House } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-panel">
        <span className="eyebrow">
          <CircleAlert size={17} />
          Erro 404
        </span>
        <h1 id="not-found-title">Pagina não encontrada</h1>
        <p>
          O endereco <strong>{location.pathname}</strong> não existe no Bau do Chef.
          Verifique o caminho digitado ou volte para a pagina inicial.
        </p>
        <button className="primary-button" type="button" onClick={() => navigate("/")}>
          <House size={18} />
          Voltar ao inicio
        </button>
      </div>
    </section>
  );
}