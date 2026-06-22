export function montarIngredientes(meal) {
  const itens = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingrediente = meal[`strIngredient${index}`];
    const medida = meal[`strMeasure${index}`];

    if (ingrediente && ingrediente.trim()) {
      itens.push(`${medida?.trim() || ""} ${ingrediente.trim()}`.trim());
    }
  }

  return itens.join(", ");
}

export function recalcularIngredientes(texto, porcoesBase, porcoesDesejadas) {
  const fator = porcoesDesejadas / porcoesBase;

  return texto
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) =>
      item.replace(/^(\d+(?:[.,]\d+)?)/, (valor) =>
        formatarNumero(Number(valor.replace(",", ".")) * fator),
      ),
    )
    .join(", ");
}

export function resumir(texto, limite) {
  if (!texto || texto.length <= limite) return texto;
  return `${texto.slice(0, limite).trim()}...`;
}

function formatarNumero(numero) {
  if (!Number.isFinite(numero)) return "";
  return Number.isInteger(numero) ? String(numero) : numero.toFixed(2).replace(/\.00$/, "").replace(/0$/, "");
}