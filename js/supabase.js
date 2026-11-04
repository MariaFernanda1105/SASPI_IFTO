// ===========================================================
// SASPI CODE — IFTO Palmas — supabase.js
// Camada de dados: grava inscrições (site) e lê/exporta (admin).
//
// Segurança:
//  * a chave "publishable/anon" é PÚBLICA por definição — quem protege os dados
//    são as políticas RLS de sql/schema.sql (anon só consegue INSERIR);
//  * NUNCA coloque a chave "service_role" aqui.
//  * sem credenciais válidas o site roda em MODO DEMO (dados só no navegador).
// ===========================================================

const SUPABASE_URL = "https://uvpcdxkjcqeglqbmtqhi.supabase.co"; // só o endereço base, SEM /rest/v1/
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cGNkeGtqY3FlZ2xxYm10cWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3OTU0NzUsImV4cCI6MjEwOTM3MTQ3NX0.q3_OCvvMR_2XMDeHMfyxIkA81CtNHa9bIgUCSSwQgzE";

const TABELAS = { jogos: "inscricoes_jogos" };
const DEMO_PREFIX = "saspi_demo_";

let supabaseClient = null;

/** true quando URL e chave foram preenchidas (ou seja: o site DEVE gravar no banco, não em demo). */
const CONFIGURADO =
  !!SUPABASE_URL && !SUPABASE_URL.includes("SEU_PROJETO") &&
  !!SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes("SUA_CHAVE");
const ERRO_CONEXAO = "Não foi possível conectar ao servidor. Verifique sua internet e tente de novo.";

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (typeof window.supabase === "undefined") return null;
  const ok =
    SUPABASE_URL && !SUPABASE_URL.includes("SEU_PROJETO") &&
    SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes("SUA_CHAVE");
  if (ok) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return supabaseClient;
}

// ---------- utilidades ----------
const limpar = (v, max = 120) =>
  String(v ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ") // remove caracteres de controle
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

/** Limita envios por navegador (evita cliques repetidos / spam simples). */
function checarLimite(chave, max = 5, janelaMs = 10 * 60 * 1000) {
  try {
    const k = "saspi_rl_" + chave;
    const agora = Date.now();
    const lista = JSON.parse(localStorage.getItem(k) || "[]").filter((t) => agora - t < janelaMs);
    if (lista.length >= max) return false;
    lista.push(agora);
    localStorage.setItem(k, JSON.stringify(lista));
  } catch (_) { /* storage bloqueado: segue sem limite local */ }
  return true;
}

function traduzirErro(error) {
  const msg = (error?.message || "").toLowerCase();
  const det = (error?.details || "").toLowerCase();
  const tudo = msg + " " + det;
  if (error?.code === "23505" || tudo.includes("duplicate") || tudo.includes("unique")) {
    if (tudo.includes("email")) return "Este e-mail já está inscrito neste jogo.";
    if (tudo.includes("matricula")) return "Esta matrícula já está inscrita neste jogo.";
    return "Você já está inscrito neste jogo.";
  }
  if (error?.code === "23514" || tudo.includes("check constraint")) return "Algum campo está em formato inválido. Revise os dados e tente de novo.";
  if (error?.code === "42501" || tudo.includes("row-level security")) return "Sem permissão para gravar. Avise a organização do evento.";
  if (tudo.includes("failed to fetch") || tudo.includes("network")) return "Sem conexão com o servidor. Verifique sua internet e tente de novo.";
  return "Não foi possível concluir agora. Tente novamente em instantes.";
}

// ---------- modo demo (localStorage) ----------
function demoLer(tabela) {
  try { return JSON.parse(localStorage.getItem(DEMO_PREFIX + tabela) || "[]"); } catch (_) { return []; }
}
function demoGravar(tabela, registro) {
  const lista = demoLer(tabela);
  const dup = lista.find((r) =>
    r.jogo === registro.jogo &&
    ((registro.email && r.email === registro.email) || (registro.matricula && r.matricula === registro.matricula)));
  if (dup) return { success: false, error: traduzirErro({ code: "23505", message: "email" }) };
  lista.push({ id: "demo-" + Date.now(), created_at: new Date().toISOString(), ...registro });
  try { localStorage.setItem(DEMO_PREFIX + tabela, JSON.stringify(lista)); } catch (_) {}
  return { success: true, isDemo: true };
}

// ---------- gravação ----------
async function inserir(tabela, registro, limiteChave) {
  if (!checarLimite(limiteChave)) {
    return { success: false, error: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo." };
  }
  const client = getSupabaseClient();
  if (!client && CONFIGURADO) return { success: false, error: ERRO_CONEXAO }; // SDK não carregou: nunca finge sucesso
  if (!client) {
    console.info("%c[SASPI] Modo demonstração: dados só neste navegador.", "color:#2f7d46;font-weight:bold");
    await new Promise((r) => setTimeout(r, 500));
    return demoGravar(tabela, registro);
  }
  try {
    // sem .select(): o visitante (anon) tem permissão só de INSERT, não de leitura
    const { error } = await client.from(tabela).insert([registro]);
    if (error) {
      console.error("[Supabase]", error);
      return { success: false, error: traduzirErro(error) };
    }
    return { success: true, isDemo: false };
  } catch (err) {
    console.error("[Supabase]", err);
    return { success: false, error: traduzirErro(err) };
  }
}

/** Inscrição nos jogos: { nome, email, telefone, aluno_ifto, matricula, faculdade, periodo, jogo } */
async function salvarInscricaoJogo(d) {
  const registro = {
    nome: limpar(d.nome),
    email: limpar(d.email, 160).toLowerCase(),
    telefone: limpar(d.telefone, 20),
    aluno_ifto: !!d.aluno_ifto,
    matricula: d.aluno_ifto ? limpar(d.matricula, 30) : null,
    faculdade: d.aluno_ifto ? null : limpar(d.faculdade),
    periodo: d.aluno_ifto ? null : limpar(d.periodo, 30),
    jogo: limpar(d.jogo, 40),
  };
  return inserir(TABELAS.jogos, registro, "jogos");
}

// ---------- área administrativa ----------
async function adminSessao() {
  const c = getSupabaseClient();
  if (!c) return CONFIGURADO ? { demo: false, session: null } : { demo: true };
  const { data } = await c.auth.getSession();
  return { demo: false, session: data?.session || null };
}
async function adminLogin(email, senha) {
  const c = getSupabaseClient();
  if (!c) return CONFIGURADO ? { success: false, error: ERRO_CONEXAO } : { success: true, demo: true };
  const { error } = await c.auth.signInWithPassword({ email, password: senha });
  return error ? { success: false, error: "E-mail ou senha incorretos." } : { success: true };
}
async function adminLogout() {
  const c = getSupabaseClient();
  if (c) await c.auth.signOut();
}
/** Lista registros (RLS só devolve linhas se o usuário for admin). */
async function adminListar(tabela) {
  const c = getSupabaseClient();
  if (!c && CONFIGURADO) return { success: false, error: ERRO_CONEXAO };
  if (!c) return { success: true, demo: true, data: demoLer(tabela).slice().reverse() };
  const { data, error } = await c.from(tabela).select("*").order("created_at", { ascending: false }).limit(5000);
  if (error) return { success: false, error: "Sem permissão ou erro ao carregar (" + (error.message || error.code) + ")." };
  return { success: true, data };
}
async function adminApagar(tabela, id) {
  const c = getSupabaseClient();
  if (!c && CONFIGURADO) return { success: false, error: ERRO_CONEXAO };
  if (!c) {
    const lista = demoLer(tabela).filter((r) => r.id !== id);
    localStorage.setItem(DEMO_PREFIX + tabela, JSON.stringify(lista));
    return { success: true };
  }
  const { error } = await c.from(tabela).delete().eq("id", id);
  return error ? { success: false, error: error.message } : { success: true };
}
