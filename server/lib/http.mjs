export function aplicarCors(resposta) {
  resposta.setHeader("Access-Control-Allow-Origin", "*");
  resposta.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  resposta.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function enviarJson(resposta, status, dados) {
  aplicarCors(resposta);
  resposta.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  resposta.end(JSON.stringify(dados));
}

export async function lerJson(requisicao) {
  const partes = [];

  for await (const parte of requisicao) {
    partes.push(parte);
  }

  if (!partes.length) return {};

  try {
    return JSON.parse(Buffer.concat(partes).toString("utf8"));
  } catch {
    const erro = new Error("JSON invalido.");
    erro.status = 400;
    throw erro;
  }
}
