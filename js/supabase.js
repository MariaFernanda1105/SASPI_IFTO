// ===========================================================
// SASPI CODE — IFTO Palmas — supabase.js
// Integração do banco de dados na nuvem via Supabase JS SDK
// ===========================================================

// INSTRUÇÕES PARA CONECTAR AO SEU PROJETO SUPABASE:
// 1. Crie seu projeto gratuito em https://supabase.com
// 2. No menu lateral, acesse "Project Settings" -> "API"
// 3. Copie a "Project URL" e a chave pública "anon public"
// 4. Cole nos campos abaixo:
const SUPABASE_URL = "https://uvpcdxkjcqeglqbmtqhi.supabase.co/rest/v1/;
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cGNkeGtqY3FlZ2xxYm10cWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3OTU0NzUsImV4cCI6MjEwOTM3MTQ3NX0.q3_OCvvMR_2XMDeHMfyxIkA81CtNHa9bIgUCSSwQgzE";

let supabaseClient = null;

/**
 * Obtém ou inicializa a instância do cliente Supabase.
 */
function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  // Verifica se o SDK do Supabase foi carregado globalmente no HTML
  if (typeof window.supabase !== "undefined") {
    // Só inicializa se o usuário já tiver trocado os placeholders pelas credenciais reais
    const isConfigured =
      SUPABASE_URL &&
      !SUPABASE_URL.includes("SEU_PROJETO") &&
      SUPABASE_ANON_KEY &&
      !SUPABASE_ANON_KEY.includes("SUA_CHAVE");

    if (isConfigured) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }
  return supabaseClient;
}

/**
 * Envia uma nova inscrição para o Supabase.
 * Se as credenciais ainda não estiverem configuradas, ativa o modo de demonstração.
 * 
 * @param {Object} dados - Objeto contendo os dados do participante
 * @returns {Promise<{success: boolean, isDemo?: boolean, error?: string, data?: any}>}
 */
async function salvarInscricao(dados) {
  const client = getSupabaseClient();

  // Caso as credenciais ainda não tenham sido configuradas:
  if (!client) {
    console.info(
      "%c[SASPI Supabase (Modo Demonstração)]%c Inscrição simulada com sucesso! Para persistir no banco real, preencha SUPABASE_URL e SUPABASE_ANON_KEY em 'js/supabase.js'.",
      "color: #2f7d46; font-weight: bold;",
      "color: inherit;"
    );

    // Simula tempo de resposta de rede (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      isDemo: true,
      data: [{ id: "demo-" + Date.now(), ...dados, created_at: new Date().toISOString() }],
    };
  }

  // Envio real para o Supabase
  try {
    const { data, error } = await client
      .from("inscricoes")
      .insert([
        {
          nome: dados.nome.trim(),
          email: dados.email.trim().toLowerCase(),
          telefone: dados.telefone.trim(),
          vinculo: dados.vinculo,
          matricula_ou_instituicao: dados.matricula_ou_instituicao.trim(),
          curso: dados.curso.trim(),
          minicursos: dados.minicursos || [],
        },
      ])
      .select();

    if (error) {
      console.error("[Supabase Error]", error);
      if (error.code === "23505" || error.message.includes("unique")) {
        return { success: false, error: "Este e-mail já possui uma inscrição cadastrada no evento." };
      }
      return { success: false, error: error.message };
    }

    return { success: true, isDemo: false, data };
  } catch (err) {
    console.error("[Supabase Exception]", err);
    return {
      success: false,
      error: err.message || "Erro inesperado ao conectar com o Supabase.",
    };
  }
}
