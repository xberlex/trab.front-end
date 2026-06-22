import { ClipboardList, PlusCircle, Utensils } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useReceitas } from "../contexts/RecipeContext";
import { categorias, tagsSugeridas } from "../data/taxonomies";

const TAMANHO_MAXIMO_PNG = 3 * 1024 * 1024;
const ASSINATURA_PNG = [137, 80, 78, 71, 13, 10, 26, 10];

const formularioInicial = {
  nome: "",
  categoria: categorias[0],
  ingredientes: "",
  modoPreparo: "",
  imagem: "",
  tags: tagsSugeridas.slice(0, 2).join(", "),
  privacidade: "privada",
  porcoesBase: 4,
  notas: "",
};

function lerComoDataUrl(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Nao foi possivel ler a imagem."));
    leitor.readAsDataURL(arquivo);
  });
}

async function arquivoTemAssinaturaPng(arquivo) {
  const bytes = new Uint8Array(await arquivo.slice(0, ASSINATURA_PNG.length).arrayBuffer());
  return ASSINATURA_PNG.every((byte, indice) => bytes[indice] === byte);
}

export function Cadastro() {
  const { usuario } = useAuth();
  const { adicionarReceita } = useReceitas();
  const navigate = useNavigate();
  const arquivoInputRef = useRef(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [erros, setErros] = useState({});
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: "" }));
    setSucesso(false);
    setErroEnvio("");
  }

  async function atualizarImagem(evento) {
    const arquivo = evento.target.files?.[0];
    setSucesso(false);
    setErroEnvio("");
    setErros((atuais) => ({ ...atuais, imagem: "" }));

    if (!arquivo) {
      setFormulario((atual) => ({ ...atual, imagem: "" }));
      return;
    }

    if (arquivo.type !== "image/png" || !arquivo.name.toLowerCase().endsWith(".png")) {
      setFormulario((atual) => ({ ...atual, imagem: "" }));
      setErros((atuais) => ({ ...atuais, imagem: "Selecione um arquivo PNG valido." }));
      evento.target.value = "";
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_PNG) {
      setFormulario((atual) => ({ ...atual, imagem: "" }));
      setErros((atuais) => ({ ...atuais, imagem: "A imagem deve ter no maximo 3 MB." }));
      evento.target.value = "";
      return;
    }

    try {
      if (!(await arquivoTemAssinaturaPng(arquivo))) {
        throw new Error("O arquivo selecionado nao e um PNG valido.");
      }

      const imagem = await lerComoDataUrl(arquivo);
      setFormulario((atual) => ({ ...atual, imagem }));
    } catch (erro) {
      setFormulario((atual) => ({ ...atual, imagem: "" }));
      setErros((atuais) => ({ ...atuais, imagem: erro.message }));
      evento.target.value = "";
    }
  }

  function validar() {
    const novosErros = {};
    if (!formulario.nome.trim()) novosErros.nome = "Nome obrigatorio.";
    if (!formulario.ingredientes.trim()) novosErros.ingredientes = "Ingredientes obrigatorios.";
    if (!formulario.modoPreparo.trim()) novosErros.modoPreparo = "Modo de preparo obrigatorio.";
    if (Number(formulario.porcoesBase) < 1) novosErros.porcoesBase = "Informe pelo menos 1 porcao.";
    return novosErros;
  }

  async function enviar(evento) {
    evento.preventDefault();
    const novosErros = validar();
    if (Object.keys(novosErros).length) {
      setErros(novosErros);
      return;
    }

    try {
      setSalvando(true);
      await adicionarReceita({
        ...formulario,
        nome: formulario.nome.trim(),
        ingredientes: formulario.ingredientes.trim(),
        modoPreparo: formulario.modoPreparo.trim(),
        notas: formulario.notas.trim(),
        tags: formulario.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      setFormulario({ ...formularioInicial, tags: "" });
      if (arquivoInputRef.current) arquivoInputRef.current.value = "";
      setSucesso(true);
    } catch (erro) {
      setErroEnvio(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="form-page">
      <div className="page-title">
        <span className="eyebrow">
          <Utensils size={17} />
          Guardar no bau de {usuario.nome}
        </span>
        <h1>Nova receita</h1>
        <p>Registre ingredientes, tecnica, tags, privacidade e notas dos seus testes.</p>
      </div>

      <form className="recipe-form" onSubmit={enviar} noValidate>
        <div className="form-grid two-columns">
          <label>
            Nome da receita
            <input name="nome" value={formulario.nome} onChange={atualizarCampo} placeholder="Ex: Risoto de cogumelos" />
            {erros.nome && <span className="field-error">{erros.nome}</span>}
          </label>
          <label>
            Categoria
            <select name="categoria" value={formulario.categoria} onChange={atualizarCampo}>
              {categorias.map((categoria) => <option key={categoria}>{categoria}</option>)}
            </select>
          </label>
        </div>

        <div className="form-grid two-columns">
          <label>
            Porções base
            <input type="number" min="1" name="porcoesBase" value={formulario.porcoesBase} onChange={atualizarCampo} />
            {erros.porcoesBase && <span className="field-error">{erros.porcoesBase}</span>}
          </label>
          <label>
            Privacidade
            <select name="privacidade" value={formulario.privacidade} onChange={atualizarCampo}>
              <option value="privada">Privada</option>
              <option value="publica">Publica</option>
            </select>
          </label>
        </div>

        <label>
          Tags de organizacao
          <input name="tags" value={formulario.tags} onChange={atualizarCampo} placeholder="Ex: Low Carb, Sous Vide, Tecnicas Francesas" />
        </label>
        <label>
          Ingredientes
          <textarea name="ingredientes" value={formulario.ingredientes} onChange={atualizarCampo} placeholder="Ex: 500 g farinha, 2 ovos, 300 ml leite" rows="5" />
          {erros.ingredientes && <span className="field-error">{erros.ingredientes}</span>}
        </label>
        <label>
          Modo de preparo
          <textarea name="modoPreparo" value={formulario.modoPreparo} onChange={atualizarCampo} placeholder="Explique o preparo em etapas simples" rows="6" />
          {erros.modoPreparo && <span className="field-error">{erros.modoPreparo}</span>}
        </label>
        <label>
          Notas de degustação e testes
          <textarea name="notas" value={formulario.notas} onChange={atualizarCampo} placeholder="Ex: Teste 1: ficou salgado. Teste 2: assar 10 min a menos." rows="4" />
        </label>
        <label>
          Imagem da receita (PNG)
          <input
            ref={arquivoInputRef}
            type="file"
            accept="image/png,.png"
            onChange={atualizarImagem}
          />
          <small className="field-hint">Arquivo opcional de ate 3 MB.</small>
          {erros.imagem && <span className="field-error">{erros.imagem}</span>}
          {formulario.imagem && (
            <span className="image-preview">
              <img src={formulario.imagem} alt="Pre-visualizacao da receita" />
              <span>Imagem PNG pronta para ser salva.</span>
            </span>
          )}
        </label>

        {sucesso && <p className="success-message">Receita guardada no banco do bau de {usuario.nome} com sucesso.</p>}
        {erroEnvio && <p className="status error">{erroEnvio}</p>}

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={salvando}>
            <PlusCircle size={19} />
            {salvando ? "Salvando..." : "Guardar receita"}
          </button>
          <button type="button" className="secondary-button" onClick={() => navigate("/receitas")}>
            <ClipboardList size={19} />
            Abrir listagem
          </button>
        </div>
      </form>
    </section>
  );
}