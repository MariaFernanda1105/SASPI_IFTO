// Netlify Function: busca a programação do evento na API do SUAP e devolve no formato usado por js/script.js.
// Autentica via OAuth2 client credentials. As credenciais ficam nas variáveis de ambiente da Netlify
// (SUAP_CLIENT_ID e SUAP_CLIENT_SECRET), nunca no site.
import { toSiteSchedule } from "../lib/programacao-format.mjs";

const SUAP_URL = "https://suap.ifto.edu.br";
const EVENTO_ID = 1902;
const MAX_PAGES = 20; // evita laço infinito se a paginação da API vier errada
const CACHE_SECONDS = 600;

async function getAccessToken() {
  const { SUAP_CLIENT_ID: id, SUAP_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) throw new Error("SUAP_CLIENT_ID/SUAP_CLIENT_SECRET não configurados");
  const res = await fetch(`${SUAP_URL}/o/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`token do SUAP: ${res.status}`);
  return (await res.json()).access_token;
}

/** A API lista os eventos do mais novo para o mais antigo; percorre as páginas até achar o evento. */
async function findEvento(token) {
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(`${SUAP_URL}/api/midia/eventos/ativos-deferidos/?page=${page}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`eventos do SUAP: ${res.status}`);
    const data = await res.json();
    const evento = data.results?.find((e) => e.id === EVENTO_ID);
    if (evento || !data.next) return evento ?? null;
  }
  return null;
}

export default async () => {
  try {
    const evento = await findEvento(await getAccessToken());
    if (!evento) return Response.json({ error: "evento não encontrado" }, { status: 404 });
    return Response.json(toSiteSchedule(evento), {
      headers: { "Cache-Control": `public, max-age=60, s-maxage=${CACHE_SECONDS}` },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "falha ao consultar o SUAP" }, { status: 502 });
  }
};

export const config = { path: "/api/programacao" };
